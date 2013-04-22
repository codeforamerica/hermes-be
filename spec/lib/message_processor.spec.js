/* jshint -W117 */ // For undeclared symbols like 'describe', 'it' and 'expect'    
var config = require('config'),
    messageProcessor = require('../../lib/message_processor.js'),
    sequelize = require('../../lib/sequelize.js'),
    fakeCaseDetailsFetcher = require('../fakes/case_details_fetcher.js')

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

          var processor = messageProcessor('+1999999USER', '+12222HERMES', 'abracadabra', null, null)

          processor.process(function(err, actualResponse) {
            expect(actualResponse).toBe(expectedResponse)
            done()
          })

        }) // END it - should respond with unrecognized message response

        it ('should save contact', function(done) {

          var usersCellNumber = '+1999999USER'

          var processor = messageProcessor(usersCellNumber, '+12222HERMES', 'abracadabra', null, null)

          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM contacts')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].cell_number).toBe(usersCellNumber)
                done()
              })
              .error(done)
          })

        }) // END it - should save contact

        it ('should save inbound message and outbound message (reply)', function(done) {

          var usersCellNumber = '+1999999USER',
              expectedHermesNumber = '+12222HERMES',
              expectedInboundMessage = 'abracadabra',
              expectedOutboundMessage = 'Sorry, I didn\'t understand that. Please call ' + config.responses.clerkPhone + ' with questions.'

          var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedInboundMessage, null, null)

          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM messages')
              .success(function(results) {
                expect(results.length).toBe(2)

                expect(results[0].sender).toBe(usersCellNumber)
                expect(results[0].recipient).toBe(expectedHermesNumber)
                expect(results[0].body).toBe(expectedInboundMessage)

                expect(results[1].sender).toBe(expectedHermesNumber)
                expect(results[1].recipient).toBe(usersCellNumber)
                expect(results[1].body).toBe(expectedOutboundMessage)

                done()
              })
              .error(done)
          })

        }) // END it - should save inbound message and outbound message (reply)

      }) // END describe - and message is unrecognized

      describe('and message is case number', function() {

        describe('and origin server is unreachable', function() {

          var fetcher

          beforeEach(function() {
            fakeFetcher = fakeCaseDetailsFetcher()
              .setError('ECONNREFUSED')
              .build()
          })

          it ('should respond with cannot find case response', function(done) {

            var expectedResponse = 'We\'re sorry, but we can\'t send you a reminder about this case. Please make sure the case number is correct, or call ' + config.responses.clerkPhone + '.'

            var processor = messageProcessor('+1999999USER', '+12222HERMES', '13-T-000001', null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedResponse)
              done()
            })

          }) // END it - should respond with unrecognized message response

          it ('should save contact', function(done) {

            var usersCellNumber = '+1999999USER'

            var processor = messageProcessor(usersCellNumber, '+12222HERMES', '13-T-000001', null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM contacts')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].cell_number).toBe(usersCellNumber)
                  done()
                })
                .error(done)
            })

          }) // END it - should save contact

          it ('should save inbound message and outbound message (reply)', function(done) {

            var usersCellNumber = '+1999999USER',
                expectedHermesNumber = '+12222HERMES',
                expectedInboundMessage = '13-T-000001',
                expectedOutboundMessage = 'We\'re sorry, but we can\'t send you a reminder about this case. Please make sure the case number is correct, or call (999) 999-9999.'

            var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(usersCellNumber)
                  expect(results[0].recipient).toBe(expectedHermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)

                  expect(results[1].sender).toBe(expectedHermesNumber)
                  expect(results[1].recipient).toBe(usersCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)
          
          it ('should save case', function(done) {
            
            var usersCellNumber = '+1999999USER',
            expectedHermesNumber = '+12222HERMES',
            expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM cases')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].number).toBe(expectedCaseNumber)
                  expect(results[0].title).toBe(null)
                  expect(results[0].next_court_datetime).toBe(null)
                  expect(results[0].next_court_location).toBe(null)
                  done()
                })
                .error(done)
            })
            
          }) // END it - should save case
          
          it ('should save case subscription in UNCONFIRMED_DELAYED state', function(done) {
            
            var usersCellNumber = '+1999999USER',
            expectedHermesNumber = '+12222HERMES',
            expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM case_subscriptions')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].state).toBe('UNCONFIRMED_DELAYED')
                  done()
                })
                .error(done)
            })
            
          }) // END it - should save case subscription
          
        }) // END describe - and origin server is unreachable
          
      }) // END describe - and message is case number
      
    }) // END describe - where contact has no subscriptions

  }) // END describe - for process

}) // END describe - Message Processor
