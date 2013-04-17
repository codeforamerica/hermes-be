var messageParser = require('../../lib/message_parser.js')

describe("Message Parser", function() {

  describe("for case numbers", function() {

    it ("should add leading 0 to year if it is a single digit", function(done) {

      var parser = messageParser("8-T-000123")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.normalized).toBe('08-T-000123')
        done()
      })

    })
    
  })
  
})

