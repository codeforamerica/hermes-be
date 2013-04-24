/* jshint -W024 */ // For the use of 'case'
var async = require('async'),
    common = require('./common.js'),
    models = require('../../../models'),
    caseDetailsFetcher = require('../../../lib/case_details_fetcher.js'),
    templateRenderer = require('../../../lib/template_renderer.js'),
    smsSender = require('../../../lib/sms_sender.js')

var findOrCreateContact = function(cellNumber, cb) {

  models.contact.findOrCreate({ cell_number: cellNumber }, {})
    .success(function(contact) { cb(null, contact) })
    .error(cb)

} // END function - findOrCreateContact

var findOrCreateCase = function(caseNumber, cb) {

  models.case.findOrCreate({ number: caseNumber }, {})
    .success(function(kase) { cb(null, kase) })
    .error(cb)

} // END function - findOrCreateCase

var findOrCreateCaseSubscription = function(kase, contact, subscriptionDateTime, cb) {

  models.case_subscription.findOrCreate({
    case_id: kase.id,
    contact_id: contact.id
  }, {
    state: 'SUBSCRIBED',
    subscription_datetime: subscriptionDateTime
  })
    .success(function(caseSubscription) { cb(null, caseSubscription) })
    .error(cb)

} // END function - findOrCreateCaseSubscription

var setCaseSubscriptionState = function(caseSubscription, state, cb) {

  caseSubscription.state = state
  caseSubscription.save()
    .success(function(caseSubscription) { cb(null, caseSubscription) })
    .error(cb)

} // END function - setCaseSubscriptionState

var persistCaseDetails = function(kase, details, cb) {

  kase.title = details.title,
  kase.next_court_datetime = details.nextCourtDateTime,
  kase.next_court_location = details.nextCourtLocation
  kase.save()
    .success(function(k) {
      cb(null, k)
    })
    .error(cb)

} // END function - persistCaseDetails

exports.post = function(req, res) {

  var caseNumber = req.params.number
  var body
  try {
    body = JSON.parse(req.body)
  } catch (err) {
    res.send(400, common.getErrorJson('Please specify valid JSON in the body of the request. See https://github.com/codeforamerica/hermes-be/blob/master/restapi/README.md#to-create-a-new-case-subscriber for details.'))
  }

  // Validation
  if (!models.case.isValidNumber(caseNumber)) {
    res.send(400, common.getErrorJson('Please specify a valid case number.'))
  }

  if (!body.hasOwnProperty('cellNumber')) {
    res.send(400, common.getErrorJson('Please specify cellphone number.'))
  }

  var cellNumber = body.cellNumber

  if (!models.contact.isValidCellNumber(cellNumber)) {
    res.send(400, common.getErrorJson('Please specify a valid cellphone number.'))
  }

  var subscriptionDateTime = new Date()
  if (body.hasOwnProperty('subscriptionDateTime')) {
    var ts = Date.parse(body.subscriptionDateTime)
    if (ts > 0) {
      subscriptionDateTime = new Date(ts)
    }
  }

  cellNumber = models.contact.normalizeCellNumber(cellNumber)
  caseNumber = models.case.normalizeCaseNumber(caseNumber)

  async.parallel([

    // Create contact if it doesn't already exist
    function(cb) { findOrCreateContact(cellNumber, cb) },

    // Create case if it doesn't already exist
    function(cb) { findOrCreateCase(caseNumber, cb) }

  ], function(err, results) {

    if (err) {
      res.send(500, 'Could not find or create case or contact.')
    }

    else {

      var contact = results[0]
      var kase = results[1]

      res.send(201, 'Case subscription created.')

    } // END else - find or create case or contact

  }) // END - async.parallel

}
