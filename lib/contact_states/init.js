var messageParser = require('./lib/message_parser.js')

module.exports = function(contact) {

  var parser = messageParser()

  var respondToCaseNumber = function(message) {

    

  } // END function - respondToCaseNumber

  return {

    respondTo: function(message) {

      if (message.type == parser.MESSAGE_TYPE_CASE) {
        reply = respondToCaseNumber(message)
      }

      else {
        reply = respondToUnrecognizedMessage(message)
      }

      return reply

    }

  } // END public object

}
