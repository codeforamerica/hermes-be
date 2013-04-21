/* jshint -W117 */ // For undeclared symbols like 'describe', 'it' and 'expect'    
var config = require('config'),
    messageProcessor = require('../../lib/message_processor.js'),
    sequelize = require('../../lib/sequelize.js')

describe('Message Processor', function() {

  beforeEach(function() {
    sequelize.drop()
    sequelize.sync()
  })

  describe('for process', function() {

    describe('where contact has no subscriptions', function() {

      describe('and message is unrecognized', function() {

        it ('should respond with unrecognized message response', function(done) {

          var expectedResponse = 'Sorry, I didn\'t understand that. Please call ' + config.responses.clerkPhone + ' with questions.'

          var processor = messageProcessor('+1999999FROM', '+122222222TO', 'abracadabra', null, null)

          processor.process(function(err, actualResponse) {
            expect(actualResponse).toBe(expectedResponse)
            done()
          })

        }) // END it - should respond with unrecognized message response

        it ('should save contact', function(done) {

          var expectedFromCellNumber = '+1999999FROM'

          var processor = messageProcessor(expectedFromCellNumber, '+122222222TO', 'abracadabra', null, null)

          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM contacts')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].cell_number).toBe(expectedFromCellNumber)
                done()
              })
              .error(done)
          })

        }) // END it - should save contact

        it ('should save message', function(done) {

          var expectedFromCellNumber = '+1999999FROM',
              expectedToNumber = '+122222222TO',
              expectedMessage = 'abracadabra'

          var processor = messageProcessor(expectedFromCellNumber, expectedToNumber, expectedMessage, null, null)

          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM messages')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].sender).toBe(expectedFromCellNumber)
                expect(results[0].recipient).toBe(expectedToNumber)
                expect(results[0].body).toBe(expectedMessage)
                done()
              })
              .error(done)
          })

        }) // END it - should save message

      }) // END describe - and message is unrecognized

    }) // END describe - where contact has no subscriptions

  }) // END describe - for process

}) // END describe - Message Processor
