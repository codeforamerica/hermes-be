var async = require('async'),
    common = require('./common.js'),
    models = require('../../../models'),
    caseDetailsFetcher = require('../../../lib/case_details_fetcher.js'),
    templateRenderer = require('../../../lib/template_renderer.js'),
    smsSender = require('../../../lib/sms_sender.js')

exports.post = function(req, res) {

  var caseNumber = req.params.number
  var body
  try {
    body = JSON.parse(req.body)
  } catch (err) {
    res.send(400, common.getErrorJson("Please specify valid JSON in the body of the request."))
  }

  // Validation
  if (!models.case.isValidNumber(caseNumber)) {
    res.send(400, common.getErrorJson("Please specify a valid case number."))
  }

  if (!body.hasOwnProperty('cellNumber')) {
    res.send(400, common.getErrorJson("Please specify cellphone number."))
  }

  var cellNumber = body.cellNumber

  if (!models.contact.isValidCellNumber(cellNumber)) {
    res.send(400, common.getErrorJson('Please specify a valid cellphone number.'))
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
  
      // Create case subscription if it doesn't already exist
      findOrCreateCaseSubscription(kase, contact, function(err, caseSubscription) {

        if (err) {
          res.send(500, 'Could not find or create case subscription.')
        }
        
        else {
          
          setCaseSubscriptionState(caseSubscription, 'SUBSCRIBED', function(err) {

            if (err) {
              res.send(500, 'Could not set subscription state to SUBSCRIBED.')
            }
            
            else {

              // Fetch case details
              var fetcher = caseDetailsFetcher(caseNumber)
              fetcher.fetch(function(err, details) {

                if (err) {
                  res.send(500, 'Could not fetch case details.')
                }

                else {

                  // Persist case details
                  persistCaseDetails(kase, details, function(err) {
                    
                    if (err) {
                      res.send(500, 'Could not persist case details.')
                    }
                    
                    else {
                      
                      // Render SMS message
                      var renderer = templateRenderer()
                      details.caseNumber = caseNumber
                      details.nextCourtDate = details.nextCourtDateTime.toFormat('DDDD, D MMMM YYYY')
                      details.nextCourtTime = details.nextCourtDateTime.toFormat('H:MI PP')
                      details.defendantNameExists = function() {
                        return (details.defendantFirstName && details.defendantLastName)
                      }
                      
                      renderer.render('resp-ok-case-subscription-confirmed', details, function(err, message) {
                        
                        if (err) {
                          res.send(500, 'Could not render SMS message.')
                        }
                        
                        else {
                          
                          // Send subscription SMS
                          var sender = smsSender()
                          sender.send(contact.cell_number, message, function(err, result) {
                            
                            if (err) {
                              res.send(500, 'Could not send subscription SMS.')
                            }
                            
                            else {
                              
                              // Record the conversation
                              models.message.create({
                                sender: result.sender,
                                recipient: result.recipient,
                                body: message,
                                external_id: result.externalId,
                                case_id: kase.id,
                                contact_id: contact.id
                              })
                                .success(function(m) { res.send(201, 'Subscription created') })
                                .error(function(err) { console.error(err); res.send(201, 'Subscription created but could not record outbound SMS conversation.') })
                              
                            } // END else - send subscription SMS
                            
                          }) // END - sendSubscriptionSms
                          
                        } // END else - render SMS message

                      }) // END - renderSmsMessage

                    } // END else - persist case details

                  }) // END - persistCaseDetails
 
                } // END else - fetch case details
                
              }) // END - fetchCaseDetails
              
            } // END else - set subscription state
            
          }) // END - setCaseSubscriptionState
          
        } // END else - find or create subscription
        
      }) // END - findOrCreateCaseSubscription
      
    } // END else - find or create case or contact

  }) // END - async.parallel
  
}

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

var findOrCreateCaseSubscription = function(kase, contact, cb) {

  models.case_subscription.findOrCreate({
    case_id: kase.id,
    contact_id: contact.id
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
