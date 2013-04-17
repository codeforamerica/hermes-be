var async = require('async'),
    config = require('config'),
    messageParser = require('./message_parser.js'),
    templateRenderer = require('./template_renderer.js'),
    caseDetailsFetcher = require('./case_details_fetcher.js'),
    models = require('../models')

module.exports = function(from, to, text, id, receivedAt) {

  var renderer = templateRenderer()
  var parser = messageParser(text)

  var RESP_OK_SUBSCRIBED_TO_CASE = function(caseNumber, details, cb) {
    details.caseNumber = caseNumber
    details.nextCourtDate = details.nextCourtDateTime.toFormat('DDDD, D MMMM YYYY')
    details.nextCourtTime = details.nextCourtDateTime.toFormat('H:MI PP')
    renderer.render("resp-ok-subscribed-to-case", details, cb)
  } // END function - RESP_OK_SUBSCRIBED_TO_CASE
  
  var RESP_ERR_UNKNOWN_MESSAGE = function(cb) {
    renderer.render("resp-err-unknown-message", { clerkPhone: config.responses.clerkPhone }, cb)
  } // END function - RESP_ERR_UNKNOWN_MESSAGE

  var RESP_ERR_ALREADY_SUBSCRIBED_TO_CASE = function(caseNumber, cb) {
    renderer.render("resp-err-already-subscribed-to-case", { caseNumber: caseNumber }, cb)
  } // END function - RESP_ERR_ALREADY_SUBSCRIBED_TO_CASE
  
  var RESP_OK_UNSUBSCRIBED_FROM_CASE = function(caseNumber, cb) {
    renderer.render("resp-ok-unsubscribed-from-case", { caseNumber: caseNumber }, cb)
  } // END function - RESP_OK_UNSUBSCRIBED_FROM_CASE

  var makeResult = function(code, body) {

    return {
      code: code,
      body: body
    }

  } // END function - makeResult

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
      .error(function(err) { cb("Could not find or create contact", null) })
    
  } // END function - findOrCreateContact
  
  var findSubscriptionsForContact = function(contact, cb) {
    
    models.case_contact.findAll({
      where: {
        subscription_state: [ 'SUBSCRIBED', 'UNCONFIRMED' ],
        contact_id: contact.id
      },
      include: [ models.case ]
    })
      .success(function(caseContacts) { cb(null, caseContacts) })
      .error(function(err) { cb("Could not determine if cases exist for contact", null) })
    
  } // END function - findSubscriptionsForContact
  
  var respondWithCurrentCaseNumber = RESP_ERR_ALREADY_SUBSCRIBED_TO_CASE

  var fetchCaseDetails = function(caseNumber, cb) {
    var fetcher = caseDetailsFetcher(caseNumber)
    fetcher.fetch(cb)
  }
  
  var respondWithNewSubscription = function(contact, caseNumber, conversation, cb) {
    
    models.case.findOrCreate({ number: caseNumber }, {})
      .success(function(kase) {
        // Create new subscription
        kase.addContact(contact)
          .success(function(k) { 
            updateInboundConversationWithCase(conversation, kase, handleError(cb, function() {
              fetchCaseDetails(caseNumber, function(err, details) {
                if (err) {
                  cb(makeError(500, 'Could not fetch case details', err))
                } else {
                  RESP_OK_SUBSCRIBED_TO_CASE(caseNumber, details, cb) 
                }
              })
            }))
          })
          .error(function(err) {
            updateInboundConversationWithCase(conversation, kase, handleError(cb, function() {
              cb(makeError(500, 'Could not associate contact with case', err))
            }))
          })
      })
      .error(function(err) { cb(makeError(500, 'Could not find or create case', err)) })
    
  }

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
          .error(function(err) { cb(makeError(500, 'Could not delete subscription', err)) })
      })
      .error(function(err) { cb(makeError(500, 'Could not unsubscribe from case', err)) })

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
            .error(function(err) { cb(makeError(500, 'Could not associate message with case.', err)) })
        } else {
          cb(null, message)
        }
      })
      .error(function(err) { cb(makeError(500, 'Could not create message with contact.', err)) })
    
  } // END function - recordInboundConversation

  var updateInboundConversationWithCase = function(conversation, kase, cb) {

    kase.addMessage(conversation)
      .success(function(k) { cb() })
      .error(function(err) { cb(makeError(500, 'Could not update message with case.', err)) })

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
        findSubscriptionsForContact(contact, handleError(cb, function(caseContacts) {

          var currentCase
          if (caseContacts.length == 1) {
            currentCase = caseContacts[0].case
          }

          // Record inbound conversation
          recordInboundConversation(contact, currentCase, handleError(cb, function(conversation) {
            
            // If contact has no case && message is a case #: find or create case + subscription (in UNCONFIRMED state)
            if ((caseContacts.length == 0) && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER)) {
              respondWithNewSubscription(contact, parsedMessage.normalized, conversation, cb)
            }
            
            // If contact has no case && message is something else: respond asking for case #
            else if (caseContacts.length == 0) {
              respondWithRequestForCaseNumber(cb)
            }
            
            // If contact has a case && message is CASE_UNSUBSCRIBE, etc.: mark case-contact as unsubscribed
            else if ((caseContacts.length == 1) && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_UNSUBSCRIBE)) {
              respondWithCaseUnsubscription(contact, currentCase, cb)
            }
            
            // If contact has a case && message is something else: respond with current case #
            else if (caseContacts.length == 1) {
              respondWithCurrentCaseNumber(currentCase.number, cb)
            }

          })) // END - recordInboundConversation

        })) // END - findSubscriptionsForContact
        
      })) // END - async.parallel

    } // END function - process
    
  } // END public object

} // END class
