var async = require('async'),
    messageParser = require('./message_parser.js'),
    models = require('../models')

module.exports = function(from, to, text, id, receivedAt) {

  var RESP_OK_SUBSCRIBED = function(caseNumber) { return "Thanks! You will receive reminders for case # " + caseNumber + "." }
  var RESP_ERR_UNKNOWN_MESSAGE = function() { return "This does not look like a case number. Here is an example of a case number: 13-T-001234. Please text back your case number. Thanks!" }
  var RESP_ERR_ALREADY_SUBSCRIBED = function(caseNumber) { return "Looks like you are already subscribed to case # " + caseNumber + ". Sorry we do not support subscribing to multiple cases from the same cell phone # at this time." }

  var parser = messageParser(text)

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
  
  var findCasesForContact = function(contact, cb) {
    
    contact.getCases()
      .success(function(cases) { cb(null, cases) })
      .error(function(err) { cb("Could not determine if cases exist for contact", null) })
    
  } // END function - findCasesForContact
  
  var respondWithCurrentCaseNumber = function(caseNumber, cb) {
    
    cb(null, RESP_ERR_ALREADY_SUBSCRIBED(caseNumber))
  
  }
  
  var respondWithNewSubscription = function(contact, caseNumber, conversation, cb) {
    
    models.case.findOrCreate({ number: caseNumber }, {})
      .success(function(kase) {
        kase.addContact(contact)
          .success(function(k) { 
            updateInboundConversationWithCase(conversation, kase, handleError(cb, function() {
              cb(null, RESP_OK_SUBSCRIBED(caseNumber)) 
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

  var respondWithRequestForCaseNumber = function(cb) {
    cb(null, RESP_ERR_UNKNOWN_MESSAGE())
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
        findCasesForContact(contact, handleError(cb, function(cases) {

          var currentCase
          if (cases.length == 1) {
            currentCase = cases[0]
          }

          // Record inbound conversation
          recordInboundConversation(contact, currentCase, handleError(cb, function(conversation) {
            
            // If contact has no case && message is a case #: find or create case
            if ((cases.length == 0) && (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER)) {
              respondWithNewSubscription(contact, parsedMessage.normalized, conversation, cb)
            }
            
            // If contact has no case && message is something else: respond asking for case #
            else if ((cases.length == 0) && (parsedMessage.type == parser.MESSAGE_TYPE_OTHER)) {
              respondWithRequestForCaseNumber(cb)
            }
            
            // If contact has a case && message is STOP, etc.: mark case-contact as unsubcribed
            else if ((cases.length == 1) && (parsedMessage.type == parser.MESSAGE_TYPE_STOP)) {
              respondWithUnsubscription(contact, currentCase, cb)
            }
            
            // If contact has a case && message is something else: respond with current case #
            else if ((cases.length == 1) 
                     && ((parsedMessage.type == parser.MESSAGE_TYPE_OTHER)
                         || (parsedMessage.type == parser.MESSAGE_TYPE_CASE_NUMBER))) {
              respondWithCurrentCaseNumber(currentCase.number, cb)
            }

          })) // END - recordInboundConversation

        })) // END - findCasesForContact
        
      })) // END - async.parallel

    } // END function - process
    
  } // END public object

} // END class
