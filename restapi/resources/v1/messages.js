var twilio = require('twilio'),
    common = require('./common.js'),
    messageProcessor = require('../../../lib/message_processor.js')

exports.post = function(req, res) {

  var sendTwimlResponse = function(responses) {

    if (!(responses instanceof Array)) {
      responses = [ responses ]
    }

    var twiml = new twilio.TwimlResponse()
    twiml.sms(responses.shift())
    for (var i in responses) {
      twiml.pause({ length: 5 })
      twiml.sms(responses[i].toString())
    }

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
    res.send(400, common.getErrorJson('Unexpected message.'))
  }

  var processor = messageProcessor(from, to, body, messageId, receivedAt)
  processor.process(function(err, responseText) {
    if (err) {
      res.send(err.code, common.getErrorJson(err.message))
    } else {
      sendTwimlResponse(responseText)
    }
  })

}


