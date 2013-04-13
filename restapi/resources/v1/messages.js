var twilio = require('twilio'),
    messageProcessor = require('../../../lib/message_processor.js')
    
exports.post = function(req, res) {

  var sendErrorResponse = function(err) {

    if (err.err) {
      console.error(err.err)
    }

    res.send(err.code, err.message)
    
  }

  var sendTwimlResponse = function(responseText) {
    
    var twiml = new twilio.TwimlResponse()
    twiml.sms(responseText)
    
    var twimlStr = twiml.toString()
    
    console.log('Responding with TwiML = ' + twimlStr)
    
    res.writeHead(200, {
      'Content-Type': 'text/xml',
      'Content-Length': twimlStr.length
    })
    res.write(twimlStr)
    res.end()
    
  }
  
  var receivedAt = new Date()
  var messageId = req.params.SmsSid
  var from = req.params.From
  var to = req.params.To
  var body = req.params.Body
  
  if (!(messageId && from && to && body)) {
    sendErrorResponse({ code: 400, message: 'Unexpected message.'})
  }

  processor = messageProcessor(from, to, body, messageId, receivedAt)
  processor.process(function(err, responseText) {
    if (err) {
      sendErrorResponse(err)
    } else {
      sendTwimlResponse(responseText)
    }
  })

}
                    

