var config = require('config'),
    twilio = require('twilio')

module.exports = function() {

  return {

    send: function(to, message, cb) {

      var from = config.sms.from

      console.log('About to send this message from ' + from + ' to ' + to + ':')
      console.log(message)

      // Actually send the SMS using Twilio
      var client
      try {
        client = twilio(config.twilio.accountSid, config.twilio.authToken)
      } catch (err) {
        console.error(err)
        cb(err)
      }

      client.sendSms({
        to: to,
        from: from,
        body: message
      }, function(err, responseData) {
        
        if (err) {
          console.error(err)
          cb(err)
        }

        else {
          cb(null, {
            recipient: to,
            sender: from,
            externalId: responseData.sid
          })

        }

      })

    }

  } // END - public object

}
