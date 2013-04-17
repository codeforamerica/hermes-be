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

    }) // END it - should add leading 0 to year if it is a single digit
    
  })

  describe("for affirmations", function() {

    it ("should accept y", function(done) {

      var parser = messageParser("y")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept y
  
    it ("should accept Y", function(done) {

      var parser = messageParser("Y")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept Y

    it ("should accept yes", function(done) {

      var parser = messageParser("yes")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept yes
  
    it ("should accept YES", function(done) {

      var parser = messageParser("YES")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept YES
  
    it ("should accept yEs", function(done) {

      var parser = messageParser("yEs")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept yEs
  
    it ("should accept ye", function(done) {

      var parser = messageParser("ye")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept ye
  
    it ("should accept yeah", function(done) {

      var parser = messageParser("yeah")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept yeah
  
    it ("should accept yah", function(done) {

      var parser = messageParser("yah")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept yah
  
    it ("should accept yup", function(done) {

      var parser = messageParser("yup")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept yup
  
    it ("should accept yep", function(done) {

      var parser = messageParser("yep")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_AFFIRMATION)
        done()
      })
      
    }) // END it - should accept yep
  
    it ("should NOT accept yeppy", function(done) {

      var parser = messageParser("yeppy")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_OTHER)
        done()
      })
      
    }) // END it - should NOT accept yeppy
  
  })

})
