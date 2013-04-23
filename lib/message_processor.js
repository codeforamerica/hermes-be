/* jshint -W024 */ // For the use of 'case'
var async = require('async'),
    config = require('config'),
    util = require('./util.js'),
    messageParser = require('./message_parser.js'),
    templateRenderer = require('./template_renderer.js'),
    caseDetailsFetcher = require('./case_details_fetcher.js'),
    models = require('../models')

module.exports = function(userNumber, hermesNumber, text, id, receivedAt, options) {

  options = options || {}
  var renderer = templateRenderer()
  var parser = messageParser(text)
  var caseDetailsFetcherKlass = options.caseDetailsFetcher || caseDetailsFetcher

  var RESP_OK_CONFIRM_CASE_SUBSCRIPTION = function(caseNumber, details, cb) {
    details.caseNumber = caseNumber
    details.prospectiveDefendantName = details.defendantFirstName + ' ' + details.defendantLastName
    details.defendantNameExists = function() {
      return (details.defendantFirstName && details.defendantLastName)
    }
    renderer.render('verify-case', details, cb)
  } // END function - RESP_OK_CONFIRM_CASE_SUBSCRIPTION

  var RESP_OK_CASE_SUBSCRIPTION_CONFIRMED = function(caseNumber, details, cb) {
    details.courtDate = details.nextCourtDateTime.toFormat('DDDD, D MMMM YYYY')
    details.courtTime = details.nextCourtDateTime.toFormat('H:MI PP')
    renderer.render('confirmation', details, cb)
  } // END function - RESP_OK_CASE_SUBSCRIPTION_CONFIRMED

  var RESP_OK_UNSUBSCRIBED_FROM_CASE = function(caseNumber, cb) {
    renderer.render('resp-ok-unsubscribed-from-case', { caseNumber: caseNumber }, cb)
  } // END function - RESP_OK_UNSUBSCRIBED_FROM_CASE

  var RESP_ERR_UNKNOWN_MESSAGE = function(cb) {
    renderer.render('resp-err-unknown-message', { clerkPhone: config.responses.clerkPhone }, cb)
  } // END function - RESP_ERR_UNKNOWN_MESSAGE

  var RESP_OK_CONFIRMATION_DELAYED_ORIGIN_UNREACHABLE = function(cb) {
    renderer.render('invalid-case', { clerkPhone: config.responses.clerkPhone }, cb)
  }

  var RESP_OK_CONFIRMATION_DELAYED_UNKNOWN_CASE = function(caseNumber, cb) {
    renderer.render('no-case', { prospectiveCaseNumber: caseNumber }, cb)
  }

  var RESP_OK_CONFIRMATION_DELAYED_UNKNOWN_CASE_YET = function(caseNumber, cb) {
    renderer.render('no-case-yet', { prospectiveCaseNumber: caseNumber }, cb)
  }

  var RESP_OK_CONFIRMATION_DELAYED_NO_COURT_DATE = function(cb) {
    renderer.render('no-court-date-yet', null, cb)
  }

  var RESP_ERR_INTERNAL_ERROR = function(cb) {
    renderer.render('resp-err-internal-error', {}, cb)
  } // END function - RESP_INTERNAL_ERROR

  var returnError = function(err, cause, cb) {
    console.error(cause)
    RESP_ERR_INTERNAL_ERROR(function(templateRenderingError, internalErrorResponse) {
      cb(err, internalErrorResponse)
    })
  }

  var findOrCreateContact = function(cb) {

    models.contact.findOrCreate({ cell_number: userNumber }, {})
      .success(function(c) { cb(null, c) })
      .error(function(err) { returnError('Could not find or create contact', err, cb) })

  } // END function - findOrCreateContact

  var findSubscriptionsForContact = function(contact, cb) {

    models.case_subscription.findAll({
      where: {
        contact_id: contact.id
      },
      include: [ models.case ]
    })
      .success(function(subscriptions) { cb(null, subscriptions) })
      .error(function(err) { returnError('Could not determine if cases exist for contact', err, cb) })

  } // END function - findSubscriptionsForContact

  var persistCaseDetails = function(kase, details, cb) {

    kase.title = details.title,
    kase.next_court_datetime = details.nextCourtDateTime,
    kase.next_court_location = details.nextCourtLocation
    kase.save()
      .success(function() {
        cb(null, details)
      })
      .error(function(err) {
        cb('Could not persist case details.')
      })

  } // END function - persistCaseDetails

  var fetchCaseDetails = function(kase, contact, cb) {
    var fetcher = caseDetailsFetcherKlass(kase.number)
    fetcher.fetch(util.handleError(cb, function(details) {
      persistCaseDetails(kase, details, cb)
    }))
  }

  var respondWithUnconfirmedSubscription = function(contact, caseNumber, conversation, event, cb) {

    var createUnconfirmedSubscription = function() {

      // Find or create new case
      models.case.findOrCreate({ number: caseNumber }, {})
        .success(function(kase) {

          // Create new subscription to case
          models.case_subscription.findOrCreate({
            case_id: kase.id,
            contact_id: contact.id,
            state: 'UNCONFIRMED'
          }, {})
            .success(function(caseSubscription) {

              // Update inbound conversation with case #
              updateInboundConversationWithCase(conversation, event, kase, util.handleError(cb, function() {

                // Fetch case details
                fetchCaseDetails(kase, contact, function(err, details) {

                  if (err) {

                    // Origin server could not be reached
                    // --> UNCONFIRMED DELAYED
                    caseSubscription.state = 'UNCONFIRMED_DELAYED'
                    caseSubscription.save()
                      .success(function() {
                        RESP_OK_CONFIRMATION_DELAYED_ORIGIN_UNREACHABLE(util.handleError(cb, function(outboundMessage) {
                          recordOutboundConversation(contact, kase, outboundMessage, cb)
                        }))
                      })
                      .error(function(err) { returnError('Could not set subscription state to UNCONFIRMED_DELAYED', err, cb) })

                  } else if (details.title === null) {

                    console.error('case # ' + kase.number + ' not found in origin server.')
                    // Case not found
                    kase.compareNumberWithMax(function(err, compareResult) {
                      if (err) {
                        returnError('Could not determine maximum case number', err, cb)
                      } else if (compareResult < 0) {
                        // case number is less than max
                        caseSubscription.state = 'UNCONFIRMED_DELAYED'
                        caseSubscription.save()
                          .success(function() {
                            RESP_OK_CONFIRMATION_DELAYED_UNKNOWN_CASE(kase.number, util.handleError(cb, function(outboundMessage) {
                              recordOutboundConversation(contact, kase, outboundMessage, cb)
                            }))
                          })
                          .error(function(err) { returnError('Could not set subscription state to UNCONFIRMED_DELAYED', err, cb) })
                      } else {
                        // case number is greater than max                        
                        caseSubscription.state = 'UNCONFIRMED_DELAYED'
                        caseSubscription.save()
                          .success(function() {
                            RESP_OK_CONFIRMATION_DELAYED_UNKNOWN_CASE_YET(kase.number, util.handleError(cb, function(outboundMessage) {
                              recordOutboundConversation(contact, kase, outboundMessage, cb)
                            }))
                          })
                          .error(function(err) { returnError('Could not set subscription state to UNCONFIRMED_DELAYED', err, cb) })
                      }
                    }) // END - compareNumberWithMax

                  } else if (details.nextCourtDateTime === null) {

                    // Next court date not found
                    // --> UNCONFIRMED DELAYED
                    caseSubscription.state = 'UNCONFIRMED_DELAYED'
                    caseSubscription.save()
                      .success(function() {
                        RESP_OK_CONFIRMATION_DELAYED_NO_COURT_DATE(util.handleError(cb, function(outboundMessage) {
                          recordOutboundConversation(contact, kase, outboundMessage, cb)
                        }))
                      })
                      .error(function(err) { returnError('Could not set subscription state to UNCONFIRMED_DELAYED', err, cb) })

                  } else {

                    // Happy path
                    RESP_OK_CONFIRM_CASE_SUBSCRIPTION(caseNumber, details, util.handleError(cb, function(outboundMessage) {
                      recordOutboundConversation(contact, kase, outboundMessage, cb)
                    }))

                  }
                })
              }))
            })
            .error(function(err) {

              // Update inbound conversation with case #
              updateInboundConversationWithCase(conversation, event, kase, util.handleError(cb, function() {
                returnError('Could not associate contact with case', err, cb)
              }))
            })

        }) // END find or create case - success
        .error(function(err) { returnError('Could not find or create case', err, cb) })

    } // END function - createUnconfirmedSubscription

    // Delete all UNCONFIRMED subscriptions for contact
    models.case_subscription.find({
      where: {
        contact_id: contact.id,
        state: [ 'UNCONFIRMED', 'UNCONFIRMED_DELAYED' ]
      }
    })
      .success(function(cc) {
        if (cc) {
          cc.destroy()
            .success(function() {
              createUnconfirmedSubscription()
            }) // END destroy - success()
            .error(function(err) { returnError('Could not delete previous unconfirmed subscriptions for contact.', err, cb) })

        } // END if - previous UNCONFIRMED subscriptions were found

        else {
          createUnconfirmedSubscription()
        } // END else - previous UNCONFIRMED subscriptions were not found

      }) // END find previous UNCONFIRMED subscriptions for contact - success()
      .error(function(err) { returnError('Could not find previous UNCONFIRMED subscriptions for contact.', err, cb) })


  } // END function - respondWithUnconfirmedSubscription

  var respondWithUnknownMessageError = function(contact, kase, cb) {
    RESP_ERR_UNKNOWN_MESSAGE(util.handleError(cb, function(outboundMessage) {
      recordOutboundConversation(contact, kase, outboundMessage, cb)
    }))
  }

  var respondWithCaseUnsubscription = function(contact, kase, cb) {

    models.case_subscription.find({
      where: {
        contact_id: contact.id,
        case_id: kase.id
      }
    })
      .success(function(cc) {
        cc.destroy()
          .success(function() {
            RESP_OK_UNSUBSCRIBED_FROM_CASE(kase.number, util.handleError(cb, function(outboundMessage) {
              recordOutboundConversation(contact, kase, outboundMessage, cb)
            }))
          })
          .error(function(err) { returnError('Could not delete subscription', err, cb) })
      })
      .error(function(err) { returnError('Could not unsubscribe from case', err, cb) })

  } // END function - respondWithCaseUnsubscription

  var respondWithConfirmedSubscription = function(contact, kase, cb) {

    models.case_subscription.find({
      where: {
        contact_id: contact.id,
        case_id: kase.id
      }
    })
      .success(function(cc) {
        cc.state = 'SUBSCRIBED'
        cc.save()
          .success(function() {
            fetchCaseDetails(kase, contact, function(err, details) {
              if (err) {
                returnError('Could not fetch case details', err, cb)
              } else {
                RESP_OK_CASE_SUBSCRIPTION_CONFIRMED(kase.number, details, util.handleError(cb, function(outboundMessage) {
                  recordOutboundConversation(contact, kase, outboundMessage, cb)
                }))
              }
            })
          })
          .error(function(err) { returnError('Could not delete subscription', err, cb) })
      })
      .error(function(err) { returnError('Could not unsubscribe from case', err, cb) })

  }

  var recordInboundConversation = function(contact, kase, cb) {

    var message = models.message.build({
      sender: userNumber,
      recipient: hermesNumber,
      external_id: id,
      body: text,
      received_at: receivedAt
    })

    contact.addMessage(message)
      .success(function(c) {
        if (kase) {
          kase.addMessage(message)
            .success(function(k) {
              recordEvent(contact, kase, text, models.event.types().SMS_INBOUND, util.handleError(cb, function(event) {
                cb(null, message, event)
              }))
            })
            .error(function(err) { returnError('Could not associate message with case.', err, cb) })
        } else {
          recordEvent(contact, null, text, models.event.types().SMS_INBOUND, util.handleError(cb, function(event) {
            cb(null, message, event)
          }))
        }
      })
      .error(function(err) { returnError('Could not create message with contact.', err, cb) })

  } // END function - recordInboundConversation

  var updateInboundConversationWithCase = function(conversation, event, kase, cb) {

    kase.addMessage(conversation)
      .success(function(k) {
        event.case_id = kase.id
        event.save()
          .success(function(e) { cb() })
          .error(function(err) { returnError('Could not update event with case.', err, cb) })
      })
      .error(function(err) { returnError('Could not update message with case.', err, cb) })

  } // END function - updateInboundConversationWithCase

  var recordOutboundConversation = function(contact, kase, text, cb) {

    var message = models.message.build({
      sender: hermesNumber,
      recipient: userNumber,
      external_id: id,
      body: text,
      received_at: new Date(),
      contact_id: contact.id,
      case_id: (kase ? kase.id : null)
    })

    message.save()
      .success(function(m) {
        recordEvent(contact, kase, text, models.event.types().SMS_OUTBOUND, util.handleError(cb, function(event) {
          cb(null, text)
        }))
      })
      .error(function(err) { returnError('Could not record outbound message.', err, cb) })

  } // END function - recordOutboundConversation

  var recordEvent = function(contact, kase, text, eventType, cb) {

    var event = models.event.build({
      type: eventType,
      data: JSON.stringify({ message: text }),
      contact_id: contact.id,
      case_id: (kase ? kase.id : null)
    })

    event.save()
      .success(function(e) { cb(null, e) })
      .error(function(err) { returnError('Could not record event.', err, cb) })

  } // END function - recordEvent

  // Public
  return {

    process: function(cb) {

      async.parallel([
        // Parse message
        parser.parse,

        // Find or create contact
        findOrCreateContact

      ], util.handleError(cb, function(results) {

        var parsedMessage = results[0]
        var contact = results[1]

        // Find cases for contact
        findSubscriptionsForContact(contact, util.handleError(cb, function(subscriptions) {

          var currentSubscription, currentCase
          if (subscriptions.length == 1) {
            currentSubscription = subscriptions[0]
            currentCase = currentSubscription.case
          }

          // Record inbound conversation
          recordInboundConversation(contact, currentCase, util.handleError(cb, function(conversation, event) {

            // If contact has no subscription && message is a case #: find or create case + subscription (in UNCONFIRMED state)
            if (!currentSubscription && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER)) {
              respondWithUnconfirmedSubscription(contact, parsedMessage.normalized, conversation, event, cb)
            }

            // If contact has a subscription && message is CASE_UNSUBSCRIBE: unsubscribe from case
            else if (currentSubscription && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_UNSUBSCRIBE)) {
              respondWithCaseUnsubscription(contact, currentCase, cb)
            }

            // If contact has a subscription in UNCONFIRMED state && message is AFFIRMATION: subscribe to case
            else if (currentSubscription &&
                     (currentSubscription.state == 'UNCONFIRMED') &&
                     (parsedMessage.type == parser.MESSAGE_TYPE_AFFIRMATION)) {
              respondWithConfirmedSubscription(contact, currentCase, cb)
            }

            // If contact has a subscription it UNCONFIRMED state && message is NEGATION: unsubsribe UNCONFIRMED case
            else if (currentSubscription &&
                     (currentSubscription.state == 'UNCONFIRMED') &&
                     (parsedMessage.type == parser.MESSAGE_TYPE_NEGATION)) {
              respondWithCaseUnsubscription(contact, currentCase, cb)
            }

            // If contact has a subscription in UNCONFIRMED or UNCONFIRMED_DELAYED state && message is a case #: unsubscribe UNCONFIRMED case and subscribe to new case
            else if (currentSubscription &&
                     ((currentSubscription.state == 'UNCONFIRMED') || (currentSubscription.state == 'UNCONFIRMED_DELAYED')) &&
                     (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER)) {
              respondWithUnconfirmedSubscription(contact, parsedMessage.normalized, conversation, event, cb)
            }

            // Catch-all: Respond with generic error message
            else {
              respondWithUnknownMessageError(contact, currentCase, cb)
            }

          })) // END - recordInboundConversation

        })) // END - findSubscriptionsForContact

      })) // END - async.parallel

    } // END function - process

  } // END public object

} // END class
