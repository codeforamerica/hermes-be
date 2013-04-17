var async = require('async'),
    config = require('config'),
    messageParser = require('./message_parser.js'),
    templateRenderer = require('./template_renderer.js'),
    caseDetailsFetcher = require('./case_details_fetcher.js'),
    models = require('../models')

module.exports = function(from, to, text, id, receivedAt) {

  var renderer = templateRenderer()
  var parser = messageParser(text)

  var RESP_OK_CONFIRM_CASE_SUBSCRIPTION = function(caseNumber, details, cb) {
    details.caseNumber = caseNumber
    details.defendantNameExists = function() {
      return (details.defendantFirstName && details.defendantLastName)
    }
    renderer.render("resp-ok-confirm-case-subscription", details, cb)
  } // END function - RESP_OK_CONFIRM_CASE_SUBSCRIPTION

  var RESP_OK_CASE_SUBSCRIPTION_CONFIRMED = function(caseNumber, details, cb) {
    details.caseNumber = caseNumber
    details.nextCourtDate = details.nextCourtDateTime.toFormat('DDDD, D MMMM YYYY')
    details.nextCourtTime = details.nextCourtDateTime.toFormat('H:MI PP')
    renderer.render("resp-ok-case-subscription-confirmed", details, cb)
  } // END function - RESP_OK_CASE_SUBSCRIPTION_CONFIRMED
  
  var RESP_OK_UNSUBSCRIBED_FROM_CASE = function(caseNumber, cb) {
    renderer.render("resp-ok-unsubscribed-from-case", { caseNumber: caseNumber }, cb)
  } // END function - RESP_OK_UNSUBSCRIBED_FROM_CASE

  var RESP_ERR_UNKNOWN_MESSAGE = function(cb) {
    renderer.render("resp-err-unknown-message", { clerkPhone: config.responses.clerkPhone }, cb)
  } // END function - RESP_ERR_UNKNOWN_MESSAGE

  var RESP_ERR_ALREADY_SUBSCRIBED_TO_CASE = function(caseNumber, cb) {
    renderer.render("resp-err-already-subscribed-to-case", { caseNumber: caseNumber }, cb)
  } // END function - RESP_ERR_ALREADY_SUBSCRIBED_TO_CASE
  
  var RESP_INTERNAL_ERROR = function() {
    renderer.render("resp-err-internal-error", {}, cb)
  } // END function - RESP_INTERNAL_ERROR
 
  var returnError = function(err, cause, cb) {
    console.error(cause)
    RESP_ERR_INTERNAL_ERROR(function(templateRenderingError, internalErrorResponse) {
      cb(err, internalErrorResponse)
    })
  }

  var handleError = function(cb, f) {
    return function(err, data) {
      if (err) { 
        cb(err)
      } else {
        f(data)
      }
    }
  } // END function - handleError
  
  var findOrCreateContact = function(cb) {
    
    models.contact.findOrCreate({ cell_number: from }, {})
      .success(function(c) { cb(null, c) })
      .error(function(err) { returnError('Could not find or create contact', err, cb) })
    
  } // END function - findOrCreateContact
  
  var findSubscriptionsForContact = function(contact, cb) {
    
    models.case_contact.findAll({
      where: {
        subscription_state: [ 'SUBSCRIBED', 'UNCONFIRMED' ],
        contact_id: contact.id
      },
      include: [ models.case ]
    })
      .success(function(subscriptions) { cb(null, subscriptions) })
      .error(function(err) { returnError('Could not determine if cases exist for contact', err, cb) })
    
  } // END function - findSubscriptionsForContact
  
  var respondWithCurrentCaseNumber = RESP_ERR_ALREADY_SUBSCRIBED_TO_CASE

  var persistCaseDetails = function(caseNumber, details, cb) {

    models.case.find({ number: caseNumber })
      .success(function(kase) {
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
      })
      .error(function(err) {
        cb('Could not find case for persisting details.')
      })

  } // END function - persistCaseDetails

  var fetchCaseDetails = function(caseNumber, cb) {
    var fetcher = caseDetailsFetcher(caseNumber)
    fetcher.fetch(handleError(cb, function(details) {
      persistCaseDetails(caseNumber, details, cb)
    }))
  }
  
  var respondWithUnconfirmedSubscription = function(contact, caseNumber, conversation, cb) {

    var createUnconfirmedSubscription = function() {

      // Find or create new case
      models.case.findOrCreate({ number: caseNumber }, {})
        .success(function(kase) {
                  
          // Create new subscription to case
          kase.addContact(contact)
            .success(function(k) { 
              
              // Update inbound conversation with case #
              updateInboundConversationWithCase(conversation, kase, handleError(cb, function() {
                
                // Fetch case details
                fetchCaseDetails(caseNumber, function(err, details) {
                  if (err) {
                    returnError('Could not fetch case details', err, cb)
                  } else {
                    RESP_OK_CONFIRM_CASE_SUBSCRIPTION(caseNumber, details, cb) 
                  }
                })
              }))
            })
            .error(function(err) {
              
              // Update inbound conversation with case #
              updateInboundConversationWithCase(conversation, kase, handleError(cb, function() {
                returnError('Could not associate contact with case', err, cb)
              }))
            })
          
        }) // END find or create case - success
        .error(function(err) { returnError('Could not find or create case', err, cb) })
      
    } // END function - createUnconfirmedSubscription

    // Delete all UNCONFIRMED subscriptions for contact
    models.case_contact.find({
      contact_id: contact.id,
      subscription_state: 'UNCONFIRMED'
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

  var respondWithRequestForCaseNumber = RESP_ERR_UNKNOWN_MESSAGE

  var respondWithCaseUnsubscription = function(contact, kase, cb) {

    models.case_contact.find({
      where: {
        contact_id: contact.id,
        case_id: kase.id
      }
    })
      .success(function(cc) {
        cc.destroy()
          .success(function() {
            RESP_OK_UNSUBSCRIBED_FROM_CASE(kase.number, cb)
          })
          .error(function(err) { returnError('Could not delete subscription', err, cb) })
      })
      .error(function(err) { returnError('Could not unsubscribe from case', err, cb) })

  } // END function - respondWithCaseUnsubscription

  var respondWithConfirmedSubscription = function(contact, kase, cb) {

    models.case_contact.find({
      where: {
        contact_id: contact.id,
        case_id: kase.id
      }
    })
      .success(function(cc) {
        cc.subscription_state = 'SUBSCRIBED'
        cc.save()
          .success(function() {
            fetchCaseDetails(kase.number, function(err, details) {
              if (err) {
                returnError('Could not fetch case details', err, cb)
              } else {
                RESP_OK_CASE_SUBSCRIPTION_CONFIRMED(kase.number, details, cb)
              }
            })
          })
          .error(function(err) { returnError('Could not delete subscription', err, cb) })
      })
      .error(function(err) { returnError('Could not unsubscribe from case', err, cb) })
    
  }

  var recordInboundConversation = function(contact, kase, cb) {

    var message = models.message.build({
      sender: from,
      recipient: to,
      external_id: id,
      body: text,
      received_at: receivedAt
    })

    contact.addMessage(message)
      .success(function(c) {
        if (kase) {
          kase.addMessage(message)
            .success(function(k) { cb(null, message) })
            .error(function(err) { returnError('Could not associate message with case.', err, cb) })
        } else {
          cb(null, message)
        }
      })
      .error(function(err) { returnError('Could not create message with contact.', err, cb) })
    
  } // END function - recordInboundConversation

  var updateInboundConversationWithCase = function(conversation, kase, cb) {

    kase.addMessage(conversation)
      .success(function(k) { cb() })
      .error(function(err) { returnError('Could not update message with case.', err, cb) })

  } // END function - updateInboundConversationWithCase

  // Public
  return {

    process: function(cb) {

      async.parallel([
        // Parse message
        parser.parse,
        
        // Find or create contact
        findOrCreateContact

      ], handleError(cb, function(results) {

        var parsedMessage = results[0]
        var contact = results[1]

        // Find cases for contact
        findSubscriptionsForContact(contact, handleError(cb, function(subscriptions) {

          var currentSubscription, currentCase
          if (subscriptions.length == 1) {
            currentSubscription = subscriptions[0]
            currentCase = currentSubscription.case
          }

          // Record inbound conversation
          recordInboundConversation(contact, currentCase, handleError(cb, function(conversation) {
            
            // If contact has no subscription && message is a case #: find or create case + subscription (in UNCONFIRMED state)
            if (!currentSubscription && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER)) {
              console.log(1)
              respondWithUnconfirmedSubscription(contact, parsedMessage.normalized, conversation, cb)
            }
            
            // If contact has no subscription && message is something else: respond asking for case #
            else if (!currentSubscription) {
              console.log(2)
              respondWithRequestForCaseNumber(cb)
            }
            
            // If contact has a subscription && message is CASE_UNSUBSCRIBE: unsubscribe from case
            else if (currentSubscription && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_UNSUBSCRIBE)) {
              console.log(3)
              respondWithCaseUnsubscription(contact, currentCase, cb)
            }

            // If contact has a subscription in UNCONFIRMED state && message is AFFIRMATION: subscribe to case
            else if (currentSubscription
                     && (currentSubscription.subscription_state == 'UNCONFIRMED')
                     && (parsedMessage.type == parser.MESSAGE_TYPE_AFFIRMATION)) {
              console.log(4)
              respondWithConfirmedSubscription(contact, currentCase, cb)
            }

            // If contact has a subscription in UNCONFIRMED state && message is a case #: unsubscribe UNCONFIRMED case and subscribe to new case
            else if (currentSubscription
                     && (currentSubscription.subscription_state == 'UNCONFIRMED')
                     && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER)) {
              console.log(5)
              respondWithUnconfirmedSubscription(contact, parsedMessage.normalized, conversation, cb)
            }
            
            // If contact has a subscription && message is something else: respond with current case #
            else if (subscriptions.length == 1) {
              console.log(6)
              respondWithCurrentCaseNumber(currentCase.number, cb)
            }

          })) // END - recordInboundConversation

        })) // END - findSubscriptionsForContact
        
      })) // END - async.parallel

    } // END function - process
    
  } // END public object

} // END class
