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
  
  }) // END describe - for affirmations

  describe("for negations", function() {

    it ("should accept n", function(done) {

      var parser = messageParser("n")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept n
  
    it ("should accept N", function(done) {

      var parser = messageParser("N")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept N

    it ("should accept no", function(done) {

      var parser = messageParser("no")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept no
  
    it ("should accept NO", function(done) {

      var parser = messageParser("NO")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept NO
  
    it ("should accept No", function(done) {

      var parser = messageParser("No")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept No
  
    it ("should accept nah", function(done) {

      var parser = messageParser("nah")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept nah
  
    it ("should accept nope", function(done) {

      var parser = messageParser("nope")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept nope
  
    it ("should accept never", function(done) {

      var parser = messageParser("never")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept never
  
    it ("should accept nada", function(done) {

      var parser = messageParser("nada")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept nada
  
    it ("should accept nopes", function(done) {

      var parser = messageParser("nopes")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept nopes
  
    it ("should accept nein", function(done) {

      var parser = messageParser("nein")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_NEGATION)
        done()
      })
      
    }) // END it - should accept nein
  
    it ("should NOT accept negative", function(done) {

      var parser = messageParser("negative")
      parser.parse(function(err, result) {
        expect(err).toBe(null)
        expect(result.type).toBe(parser.MESSAGE_TYPE_OTHER)
        done()
      })
      
    }) // END it - should NOT accept negative
  
  }) // END describe - for negations

})
