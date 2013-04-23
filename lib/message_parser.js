/* jshint -W024 */ // For the use of 'case'
var models = require('../models')

module.exports = function(message, options) {

  // Private properties
  var CASE_UNSUBSCRIBE_REGEXP = /^[uU]$/
  var AFFIRMATION_REGEXP = /^\s?y/i
  var NEGATION_REGEXP = /^\s?n/i

  var MESSAGE_TYPE_OTHER = 'other'
  var MESSAGE_TYPE_CASE_NUMBER = 'case_number'
  var MESSAGE_TYPE_CASE_UNSUBSCRIBE = 'case_unsubscribe'
  var MESSAGE_TYPE_AFFIRMATION = 'affirmation'
  var MESSAGE_TYPE_NEGATION = 'negation'

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

    return makeResult(MESSAGE_TYPE_CASE_NUMBER, models.case.normalizeCaseNumber(regexpMatchResult[0]))

  } // END function - parseCaseNumber

  /*
   * Parses a case unsubscribe message, normalizes it and returns the result.
   * @param regexpMatchResult Array Result of a successful regexp match of case unsubscribe message.
   * @return Object Result of parsing the case unsubsribe message.
   */
  var parseCaseUnsubscribe = function(regexpMatchResult) {

    return makeResult(MESSAGE_TYPE_CASE_UNSUBSCRIBE, 'U')

  } // END function - parseCaseUnsubscribe

  /*
   * Parses an affirmation message, normalizes it and returns the result.
   * @param regexpMatchResult Array Result of a successful regexp match of case unsubscribe message.
   * @return Object Result of parsing the affirmation message.
   */
  var parseAffirmation = function(regexpMatchResult) {

    return makeResult(MESSAGE_TYPE_AFFIRMATION, 'YES')

  } // END function - parseAffirmation

  /*
   * Parses an negation message, normalizes it and returns the result.
   * @param regexpMatchResult Array Result of a successful regexp match of case unsubscribe message.
   * @return Object Result of parsing the negation message.
   */
  var parseNegation = function(regexpMatchResult) {

    return makeResult(MESSAGE_TYPE_NEGATION, 'NO')

  } // END function - parseNegation

  // Public section
  return {

    MESSAGE_TYPE_OTHER: MESSAGE_TYPE_OTHER,
    MESSAGE_TYPE_CASE_NUMBER: MESSAGE_TYPE_CASE_NUMBER,
    MESSAGE_TYPE_CASE_UNSUBSCRIBE: MESSAGE_TYPE_CASE_UNSUBSCRIBE,
    MESSAGE_TYPE_AFFIRMATION: MESSAGE_TYPE_AFFIRMATION,
    MESSAGE_TYPE_NEGATION: MESSAGE_TYPE_NEGATION,

    /*
     * Parses the message and calls given callback with results.
     * @param cb Function cb(error, result)
     */
    parse: function(cb) {

      var matches

      // Empty message
      if (!message) {
        cb({ message: 'No message given.' }, null)
      }

      var m = message.trim()
      if (m.length === 0) {
        cb({ message: 'Empty message given.' }, null)
      }

      // Case number
      else if (models.case.isValidNumber(m)) {
        cb(null, parseCaseNumber(m.match(models.case.getCaseNumberRegexp())))
      }

      // Case unsubscribe
      else if ((matches = m.match(CASE_UNSUBSCRIBE_REGEXP))) {
        cb(null, parseCaseUnsubscribe(matches))
      }

      // Affirmation
      else if ((matches = m.match(AFFIRMATION_REGEXP))) {
        cb(null, parseAffirmation(matches))
      }

      // Negation
      else if ((matches = m.match(NEGATION_REGEXP))) {
        cb(null, parseNegation(matches))
      }

      // Something else
      else {
        cb(null, makeResult())
      }

    } // END function - parse

  } // END return - public object

} // END class
