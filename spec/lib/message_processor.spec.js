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
                expect(results[0].contact_id).not.toBe(null)
                expect(results[0].case_id).toBe(null)

                expect(results[1].sender).toBe(expectedHermesNumber)
                expect(results[1].recipient).toBe(usersCellNumber)
                expect(results[1].body).toBe(expectedOutboundMessage)
                expect(results[1].contact_id).not.toBe(null)
                expect(results[1].case_id).toBe(null)

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

          }) // END it - should respond with cannot find case response

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
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(expectedHermesNumber)
                  expect(results[1].recipient).toBe(usersCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

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

        describe('and case not found on origin server', function() {

          xdescribe('and case number < max. case number in Hermes', function() {

            var fetcher

            beforeEach(function() {
              fakeFetcher = fakeCaseDetailsFetcher()
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
                    expect(results[0].contact_id).not.toBe(null)
                    expect(results[0].case_id).not.toBe(null)

                    expect(results[1].sender).toBe(expectedHermesNumber)
                    expect(results[1].recipient).toBe(usersCellNumber)
                    expect(results[1].body).toBe(expectedOutboundMessage)
                    expect(results[1].contact_id).not.toBe(null)
                    expect(results[1].case_id).not.toBe(null)

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

          }) // END describe - and case number < max. case number in Hermes

        }) // END describe - and case not found on origin server

        describe('and case does not have next court date yet', function() {

          var fetcher
          var expectedCaseTitle = 'COMMONWEALTH VS. DOE, JOHN F'

          beforeEach(function() {
            fakeFetcher = fakeCaseDetailsFetcher()
              .setTitle(expectedCaseTitle)
              .build()
          })

          it ('should respond with no court date yet response', function(done) {

            var expectedResponse = 'We don\'t have a court date assigned to this case yet. Please wait and we will text you the court date whenever it becomes available.'

            var processor = messageProcessor('+1999999USER', '+12222HERMES', '13-T-000001', null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedResponse)
              done()
            })

          }) // END it - should respond with no court date yet response

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
                expectedOutboundMessage = 'We don\'t have a court date assigned to this case yet. Please wait and we will text you the court date whenever it becomes available.'

            var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(usersCellNumber)
                  expect(results[0].recipient).toBe(expectedHermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(expectedHermesNumber)
                  expect(results[1].recipient).toBe(usersCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

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
                  expect(results[0].title).toBe(expectedCaseTitle)
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

        }) // END describe - and case does not have next court date yet

        describe('and all case details are found', function() {

          var fetcher
          var expectedCaseTitle = 'COMMONWEALTH VS. DOE, JOHN F'
          var expectedCaseNextCourtDateTime = new Date()
          var expectedCaseNextCourtLocation = 'HJ301'

          beforeEach(function() {
            fakeFetcher = fakeCaseDetailsFetcher()
              .setTitle(expectedCaseTitle)
              .setNextCourtDateTime(expectedCaseNextCourtDateTime)
              .setNextCourtLocation(expectedCaseNextCourtLocation)
              .build()
          })

          it ('should respond with subscription confirmation response', function(done) {

            var expectedResponse = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'

            var processor = messageProcessor('+1999999USER', '+12222HERMES', '13-T-000001', null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedResponse)
              done()
            })

          }) // END it - should respond with subscription confirmation response

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
                expectedOutboundMessage = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'

            var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(usersCellNumber)
                  expect(results[0].recipient).toBe(expectedHermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(expectedHermesNumber)
                  expect(results[1].recipient).toBe(usersCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

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
                  expect(results[0].title).toBe(expectedCaseTitle)
                  expect((new Date(results[0].next_court_datetime + ' UTC')).toString()).toBe(expectedCaseNextCourtDateTime.toString())
                  expect(results[0].next_court_location).toBe(expectedCaseNextCourtLocation)
                  done()
                })
                .error(done)
            })

          }) // END it - should save case

          it ('should save case subscription in UNCONFIRMED state', function(done) {

            var usersCellNumber = '+1999999USER',
            expectedHermesNumber = '+12222HERMES',
            expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(usersCellNumber, expectedHermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM case_subscriptions')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].state).toBe('UNCONFIRMED')
                  done()
                })
                .error(done)
            })

          }) // END it - should save case subscription

        }) // END describe - and all case details are found

      }) // END describe - and message is case number

    }) // END describe - where contact has no subscriptions

  }) // END describe - for process

}) // END describe - Message Processor
