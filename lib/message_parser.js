var sprintf = require('sprintf').sprintf

module.exports = function(message, options) {

  // Private properties
  var CASE_NUMBER_REGEXP = /(\d[1-9]?)-?([A-Za-z]+)-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?/
  var CASE_UNSUBSCRIBE_REGEXP = /^[uU]$/

  var MESSAGE_TYPE_OTHER = "other"
  var MESSAGE_TYPE_CASE_NUMBER = "case_number"
  var MESSAGE_TYPE_CASE_UNSUBSCRIBE = "case_unsubscribe"

  // Private methods

  /*
   * Returns a result object given a message type and normalized message.
   * @param messageType String Type of message. Optional. Default: MESSAGE_TYPE_OTHER.
   * @param normalizedMessage String Message, normalized after parsing. Optional. Default: original, unparsed message.
   * @return Object Result
   */
  var makeResult = function(messageType, normalizedMessage) {

    return {
      original: message,
      type: messageType || MESSAGE_TYPE_OTHER,
      normalized: normalizedMessage || message
    }

  } // END function - makeResult

  /*
   * Parses a case number message, normalizes it and returns the result.
   * @param regexpMatchResult Array Result of a successful regexp match of case number message.
   * @return Object Result of parsing the case number message.
   */
  var parseCaseNumber = function(regexpMatchResult) {

    // regexpMatchResult[1] = 13 | 04 | 4
    // regexpMatchResult[2] = T
    // regexpMatchResult[3] = 123456 | 000789 | 789
    // regexpMatchResult[4] = 001 | 1

    // Construct canonical case number from parts
    var canonical = ''
    var year = parseInt(regexpMatchResult[1])
    var type = regexpMatchResult[2].toUpperCase()
    var serial = parseInt(regexpMatchResult[3])

    if (regexpMatchResult[4]) {
      var defendant = parseInt(regexpMatchResult[4])
      canonical = sprintf('%2d-%s-%06d-%3d', year, type, serial, defendant)
    } else {
      canonical = sprintf('%2d-%s-%06d', year, type, serial)
    }

    return makeResult(MESSAGE_TYPE_CASE_NUMBER, canonical)
 
  } // END function - parseCaseNumber

  /*
   * Parses a case unsubscribe message, normalizes it and returns the result.
   * @param regexpMatchResult Array Result of a successful regexp match of case unsubscribe message.
   * @return Object Result of parsing the case unsubsribe message.
   */
  var parseCaseUnsubscribe = function(regexpMatchResult) {

    return makeResult(MESSAGE_TYPE_CASE_UNSUBSCRIBE, 'U')

  } // END function - parseCaseUnsubscribe

  // Public section
  return {

    MESSAGE_TYPE_OTHER: MESSAGE_TYPE_OTHER,
    MESSAGE_TYPE_CASE_NUMBER: MESSAGE_TYPE_CASE_NUMBER,
    MESSAGE_TYPE_CASE_UNSUBSCRIBE: MESSAGE_TYPE_CASE_UNSUBSCRIBE,

    /*
     * Parses the message and calls given callback with results.
     * @param cb Function cb(error, result)
     */
    parse: function(cb) {

      // Empty message
      if (!message) {
          cb({ message: 'No message given.' }, null)
      }
        
      m = message.trim()
      if (m.length == 0) {
        cb({ message: 'Empty message given.' }, null)
      }

      // Case number
      else if ((matches = m.match(CASE_NUMBER_REGEXP))) {
        cb(null, parseCaseNumber(matches))
      }

      // Case unsubscribe
      else if ((matches = m.match(CASE_UNSUBSCRIBE_REGEXP))) {
        cb(null, parseCaseUnsubscribe(matches))
      }
      
      // Something else
      else {
        cb(null, makeResult())
      }

    } // END function - parse

  } // END return - public object

} // END class
