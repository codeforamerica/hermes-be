var models = require('../../../models'),
    sprintf = require('sprintf').sprintf,
    twilio = require('twilio')

var makeError = function(code, message, err) {

  console.error(err)
  return {
    code: code,
    message: message
  }
}

var sendTwimlResponse = function(response, res) {

  var twiml = new twilio.TwimlResponse()
  twiml.sms(response.message)

  var body = twiml.toString()

  console.log('Responding with status code = ' + response.code)
  console.log('Responding with TwiML = ' + body)

  res.writeHead(response.code, {
    'Content-Type': 'text/xml',
    'Content-Length': body.length
  })
  res.write(body)
  res.end()

}

var createContactIfNotExists = function(cellNumber, cb) {

  models.contact.findOrCreate({ cell_number: cellNumber }, {})
    .success(function(c) { cb(null, c) })
    .error(function(err) { cb(makeError(500, "Could not find or create contact", err)) })

}

var checkIfCaseExistsForContact = function(contact, cb) {

  contact.getCases()
    .success(function(cases) { cb(null, cases) })
    .error(function(err) { cb(makeError(500, "Could not determine if cases exist for contact", err)) })
  
}

var parseCaseNumberFromBody = function(body, cb) {

  // 13-T-123456-001 (canonical) : \d[1-9]-[A-Z]-\d{6}-(\d{3})
  // 13-T-123456 (canonical) : (\d[1-9])-([A-Z])-(\d{6})(-(\d{3}))?
  // 03-T-123456 (canonical) : (\d[1-9])-([A-Za-z])-(\d{6})(-(\d{3}))?
  // 03-t-123456 => 03-T-123456 : (\d[1-9])-([A-Za-z])-(\d{6})(-(\d{3}))?
  // 3-T-123456 => 03-T-123456 : (\d[1-9]?)-([A-Za-z])-(\d{6})(-(\d{3}))?
  // 13T123456 => 13-T-123456 : (\d[1-9]?)-?([A-Za-z])-?(\d{6})(-(\d{3}))?
  // 13T123456001 => 13-T-123456-001 : (\d[1-9]?)-?([A-Za-z])-?(\d{6})-?(\d{3})?
  // 13T456 => 13-T-000456 : (\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{3})?
  // 13T456-001 => 13-T-000456-001 : (\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{3})?
  // 13T456-1 => 13-T-000456-001 : (\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?
  // 13T4561 => 13-T-004561 : (\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?

  var r = /(\d[1-9]?)-?([A-Za-z])-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?/

  var m = body.match(r)
  // m[1] = 13 | 04 | 4
  // m[2] = T
  // m[3] = 123456 | 000789 | 789
  // m[4] = 001 | 1

  // Construct canonical
  var c, err
  if (m) {

    var year = parseInt(m[1])
    var type = m[2]
    var serial = parseInt(m[3])

    if (m[4]) {
      var defendant = parseInt(m[4])
      c = sprintf('%2d-%s-%6d-%3d', year, type, serial, defendant)
    } else {
      c = sprintf('%2d-%s-%6d', year, type, serial)
    }
 
    cb(null, c)

  } else { 
  
    err = 'Could not parse case number from body'
    cb(makeError(200, "This does not look like a case number", err))

  }

}

var processBodyForExistingCaseContact = function(contact, kase, body, cb) {

  cb(makeError(200, "Looks like you are already subscribed to case # "
               + kase.number + ". Sorry we do not support subscribing "
               + "to multiple cases from the same cell phone # at this "
               + "time."))

}

var createCaseForContact = function(caseNumber, contact, cb) {

  var kase = models.case.build({
    number: caseNumber
  })

  kase.save()
    .success(function(c) {
      c.setContacts([ contact ])
        .success(function(k) { cb(null, kase) })
        .error(function(err) { cb(makeError(500, 'Could not associate contact with case', err)) })
    })
    .error(function(err) { cb(makeError(500, 'Could not create case', err)) })

}

var recordMessageFromContact = function(from, to, messageId, body, contact, kase, cb) {

  var message = models.message.build({
    sender: from,
    recipient: to,
    external_id: messageId,
    body: body
  })
  
  contact.addMessage(message)
    .success(function(c) {
      if (kase) {
        kase.addMessage(message)
          .success(function(k) { cb(null, message) })
          .error(function(err) { cb(makeError(500, 'Could not associate message with case.', err)) })
      }
    })
    .error(function(err) { cb(makeError(500, 'Could not create message with contact.', err)) })
  
}

exports.post = function(req, res) {

  var messageId = req.params.SmsSid
  var from = req.params.From
  var to = req.params.To
  var body = req.params.Body

  if (!(messageId && from && to && body)) {
    sendTwimlResponse({ code: 400, message: 'Unexpected message.'}, res)
  }

  var receivedOn = new Date()

  // Create contact if doesn't exist
  createContactIfNotExists(from, function(err, contact) {
    
    if (err) sendTwimlResponse(err, res)

    checkIfCaseExistsForContact(contact, function(err, cases) {

      if (err) sendTwimlResponse(err, res)
      
      if (cases.length == 0) {

        // Contact found/created but there is no case associated with it
        
        parseCaseNumberFromBody(body, function(err, caseNumber) {

          if (err) sendTwimlResponse(err, res)
          else {
  
            createCaseForContact(caseNumber, contact, function(err, kase) {
              
              if (err) sendTwimlResponse(err, res)
              
              recordMessageFromContact(from, to, messageId, body, contact, kase, function(err) {

                if (err) sendTwimlResponse(err, res)
                
                sendTwimlResponse({ code: 201, message: 'Case created for contact.'}, res)

              })
              
            })
            
          }
          
        })
        
      } else {
        
        // Contact found and there is a case associated with it

        var kase = cases[0]

        processBodyForExistingCaseContact(contact, kase, body, function(err, response) {

          if (err) sendTwimlResponse(err, res)

          sendTwimlResponse(response, res)

        })
        
      }

    })
    
  })

}
