/* jshint -W117 */ // For undeclared symbols like 'describe', 'it' and 'expect'    
/* jshint -W024 */ // For the use of 'case'
var config = require('config'),
    messageProcessor = require('../../lib/message_processor.js'),
    sequelize = require('../../lib/sequelize.js'),
    fakeCaseDetailsFetcher = require('../fakes/case_details_fetcher.js'),
    models = require('../../models')

describe('Message Processor', function() {

  beforeEach(function(done) {
    sequelize.drop()
      .success(function() {
        sequelize.sync()
        setTimeout(done, 10)
      })
  })

  describe('for process', function() {

    var userCellNumber = '+1999999USER'
    var hermesNumber = '+12222HERMES'

    describe('where contact has no subscriptions', function() {

      describe('and message is unrecognized', function() {

        var expectedInboundMessage = 'abracadabra'
        var expectedOutboundMessage = 'Sorry, I didn\'t understand that. Please call ' + config.responses.clerkPhone + ' with questions.'

        it ('should respond with unrecognized message response', function(done) {

          var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

          processor.process(function(err, actualResponse) {
            expect(actualResponse).toBe(expectedOutboundMessage)
            done()
          })

        }) // END it - should respond with unrecognized message response

        it ('should save contact', function(done) {

          var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM contacts')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].cell_number).toBe(userCellNumber)
                done()
              })
              .error(done)
          })

        }) // END it - should save contact

        it ('should save inbound message and outbound message (reply)', function(done) {

          var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM messages')
              .success(function(results) {
                expect(results.length).toBe(2)

                expect(results[0].sender).toBe(userCellNumber)
                expect(results[0].recipient).toBe(hermesNumber)
                expect(results[0].body).toBe(expectedInboundMessage)
                expect(results[0].contact_id).not.toBe(null)
                expect(results[0].case_id).toBe(null)

                expect(results[1].sender).toBe(hermesNumber)
                expect(results[1].recipient).toBe(userCellNumber)
                expect(results[1].body).toBe(expectedOutboundMessage)
                expect(results[1].contact_id).not.toBe(null)
                expect(results[1].case_id).toBe(null)

                done()
              })
              .error(done)
          })

        }) // END it - should save inbound message and outbound message (reply)

        it ('should save events for inbound and outbound message (reply)', function(done) {

          var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)
          processor.process(function(err, actualResponse) {
            sequelize.query('SELECT * FROM events')
              .success(function(results) {

                expect(results.length).toBe(2)

                expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                var data = JSON.parse(results[0].data)
                expect(data.message).toBe(expectedInboundMessage)

                expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                data = JSON.parse(results[1].data)
                expect(data.message).toBe(expectedOutboundMessage)

                done()

              })
              .error(done)
          })

        }) // END it - should save events for inbound and outbound message (reply)

      }) // END describe - and message is unrecognized

      describe('and message is case number', function() {

        describe('and origin server is unreachable', function() {

          var fetcher
          var expectedInboundMessage = '13-T-000001'
          var expectedOutboundMessage = 'We\'re sorry, but we can\'t send you a reminder about this case. Please make sure the case number is correct, or call ' + config.responses.clerkPhone + '.'

          beforeEach(function() {
            fakeFetcher = fakeCaseDetailsFetcher()
              .setError('ECONNREFUSED')
              .build()
          })

          it ('should respond with cannot find case response', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with cannot find case response

          it ('should save contact', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM contacts')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].cell_number).toBe(userCellNumber)
                  done()
                })
                .error(done)
            })

          }) // END it - should save contact

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

          it ('should save case', function(done) {

            var expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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

            var expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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
            var expectedInboundMessage = '13-T-000001'
            var expectedOutboundMessage = 'We\'re sorry, but we can\'t send you a reminder about this case. Please make sure the case number is correct, or call ' + config.responses.clerkPhone + '.'

            beforeEach(function() {
              fakeFetcher = fakeCaseDetailsFetcher()
                .build()
            })

            it ('should respond with cannot find case response', function(done) {

              var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

              processor.process(function(err, actualResponse) {
                expect(actualResponse).toBe(expectedOutboundMessage)
                done()
              })

            }) // END it - should respond with unrecognized message response

            it ('should save contact', function(done) {

              var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

              processor.process(function(err, actualResponse) {
                sequelize.query('SELECT * FROM contacts')
                  .success(function(results) {
                    expect(results.length).toBe(1)
                    expect(results[0].cell_number).toBe(userCellNumber)
                    done()
                  })
                  .error(done)
              })

            }) // END it - should save contact

            it ('should save inbound message and outbound message (reply)', function(done) {

              var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

              processor.process(function(err, actualResponse) {
                sequelize.query('SELECT * FROM messages')
                  .success(function(results) {
                    expect(results.length).toBe(2)

                    expect(results[0].sender).toBe(userCellNumber)
                    expect(results[0].recipient).toBe(hermesNumber)
                    expect(results[0].body).toBe(expectedInboundMessage)
                    expect(results[0].contact_id).not.toBe(null)
                    expect(results[0].case_id).not.toBe(null)

                    expect(results[1].sender).toBe(hermesNumber)
                    expect(results[1].recipient).toBe(userCellNumber)
                    expect(results[1].body).toBe(expectedOutboundMessage)
                    expect(results[1].contact_id).not.toBe(null)
                    expect(results[1].case_id).not.toBe(null)

                    done()
                  })
                  .error(done)
              })

            }) // END it - should save inbound message and outbound message (reply)

            it ('should save events for inbound and outbound message (reply)', function(done) {

              var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
              processor.process(function(err, actualResponse) {
                sequelize.query('SELECT * FROM events')
                  .success(function(results) {

                    expect(results.length).toBe(2)

                    expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                    var data = JSON.parse(results[0].data)
                    expect(data.message).toBe(expectedInboundMessage)

                    expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                    data = JSON.parse(results[1].data)
                    expect(data.message).toBe(expectedOutboundMessage)

                    done()

                  })
                  .error(done)
              })

            }) // END it - should save events for inbound and outbound message (reply)

            it ('should save case', function(done) {

              var expectedCaseNumber = '13-T-000001'

              var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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

              var expectedCaseNumber = '13-T-000001'

              var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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
          var expectedCaseNumber = '13-T-000001'
          var expectedCaseTitle = 'COMMONWEALTH VS. DOE, JOHN F'
          var expectedInboundMessage = '13-T-000001'
          var expectedOutboundMessage = 'We don\'t have a court date assigned to this case yet. Please wait and we will text you the court date whenever it becomes available.'

          beforeEach(function() {
            fakeFetcher = fakeCaseDetailsFetcher()
              .setTitle(expectedCaseTitle)
              .build()
          })

          it ('should respond with no court date yet response', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with no court date yet response

          it ('should save contact', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM contacts')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].cell_number).toBe(userCellNumber)
                  done()
                })
                .error(done)
            })

          }) // END it - should save contact

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

          it ('should save case', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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
          var expectedInboundMessage = '13-T-000001'
          var expectedOutboundMessage = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'

          beforeEach(function() {
            fakeFetcher = fakeCaseDetailsFetcher()
              .setTitle(expectedCaseTitle)
              .setNextCourtDateTime(expectedCaseNextCourtDateTime)
              .setNextCourtLocation(expectedCaseNextCourtLocation)
              .build()
          })

          it ('should respond with subscription confirmation response', function(done) {

            var expectedOutboundMessage = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with subscription confirmation response

          it ('should save contact', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM contacts')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].cell_number).toBe(userCellNumber)
                  done()
                })
                .error(done)
            })

          }) // END it - should save contact

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

          it ('should save case', function(done) {

            var expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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

            var expectedCaseNumber = '13-T-000001'

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

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

    describe('where contact has a subscription', function() {

      describe('and subscription is in any state', function() {

        var expectedCaseNumber = '13-T-012345'
        var expectedCaseTitle = 'COMMONWEALTH VS. CHICKEN, COW P'
        var expectedCaseNextCourtDateTime = new Date('5/18/2013 11:11')

        beforeEach(function(done) {

          models.contact.create({
            cell_number: userCellNumber
          })
            .success(function(c) {

              models.case.create({
                number: expectedCaseNumber,
                next_court_datetime: expectedCaseNextCourtDateTime
              })
                .success(function(k) {

                  models.case_subscription.create({
                    contact_id: c.id,
                    case_id: k.id,
                    state: 'FOOBAR'
                  })
                    .success(function(cs) {
                      done()
                    }) // END - success case_subscription.create
                    .error(function(err) {
                      console.error(err)
                    })

                }) // END - success case.create
                .error(function(err) {
                  console.error(err)
                })

            }) // END - success contact.create
            .error(function(err) {
              console.error(err)
            })

        })

        describe('and message is unrecognized', function() {

          var expectedInboundMessage = 'abracadabra'
          var expectedOutboundMessage = 'Sorry, I didn\'t understand that. Please call ' + config.responses.clerkPhone + ' with questions.'

          it ('should respond with unrecognized message response', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with unrecognized message response

          it ('should save contact', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM contacts')
                .success(function(results) {
                  expect(results.length).toBe(1)
                  expect(results[0].cell_number).toBe(userCellNumber)
                  done()
                })
                .error(done)
            })

          }) // END it - should save contact

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is unrecognized

        describe('and message is unsubscribe', function() {

          var expectedInboundMessage = 's'
          var expectedOutboundMessage = 'Thanks! You will no longer receive reminders for case # ' + expectedCaseNumber + '.'

          it ('should respond with unsubscribed message response', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with unsubscribed message response

          it ('should remove subscription', function(done) {

            sequelize.query('SELECT * FROM case_subscriptions')
              .success(function(results) {
                expect(results.length).toBe(1)

                var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)
                processor.process(function(err, actualResponse) {

                  sequelize.query('SELECT * FROM case_subscriptions')
                    .success(function(results) {
                      expect(results.length).toBe(0)
                      done()
                    })
                    .error(done)

                }) // END - processor.process

              }) // END - success
              .error(done)

          }) // END it - should remove subscription

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is unsubscribe

      }) // END describe - and subscription is in any state

      describe('and subscription is UNCONFIRMED', function() {

        var expectedCaseNumber = '13-T-000003'
        var expectedCaseTitle = 'COMMONWEALTH VS. CHICKEN, COW P'
        var expectedCaseNextCourtDateTime = new Date('5/18/2013 11:11')
        var fakeFetcher

        beforeEach(function(done) {

          fakeFetcher = fakeCaseDetailsFetcher()
            .setTitle(expectedCaseTitle)
            .setNextCourtDateTime(expectedCaseNextCourtDateTime)
            .build()

          models.contact.create({
            cell_number: userCellNumber
          })
            .success(function(c) {

              models.case.create({
                number: expectedCaseNumber,
                next_court_datetime: expectedCaseNextCourtDateTime
              })
                .success(function(k) {

                  models.case_subscription.create({
                    contact_id: c.id,
                    case_id: k.id,
                    state: 'UNCONFIRMED'
                  })
                    .success(function(cs) {
                      done()
                    }) // END - success case_subscription.create
                    .error(function(err) {
                      console.error(err)
                    })

                }) // END - success case.create
                .error(function(err) {
                  console.error(err)
                })

            }) // END - success contact.create
            .error(function(err) {
              console.error(err)
            })

        })

        describe('and message is affirmation', function() {

          var expectedInboundMessage = 'y'
          var expectedOutboundMessage = 'You need to come to court on Saturday, 18 May 2013, at 11:11 AM. We will send you a reminder text message a day before your court date.'
          it('should respond with confirmed message', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          })

          it('should update the state to CONFIRMED', function(done) {

            sequelize.query('SELECT * FROM case_subscriptions')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].state).toBe('UNCONFIRMED')

                var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
                processor.process(function(err, actualResponse) {

                  sequelize.query('SELECT * FROM case_subscriptions')
                    .success(function(results) {
                      expect(results.length).toBe(1)
                      expect(results[0].state).toBe('SUBSCRIBED')
                      done()
                    })
                    .error(done)

                }) // END - processor.process

              }) // END - success
              .error(done)

          })

          it('should save inbound messsage and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)
                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is affirmation

        describe('and message is negation', function() {

          var expectedInboundMessage = 'no'
          var expectedOutboundMessage = 'Thanks! You will no longer receive reminders for case # ' + expectedCaseNumber + '.'

          it ('should respond with unsubscribed message response', function(done) {

            var expectedOutboundMessage = 'Thanks! You will no longer receive reminders for case # ' + expectedCaseNumber + '.'
            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with unsubscribed message response

          it ('should remove subscription', function(done) {

            sequelize.query('SELECT * FROM case_subscriptions')
              .success(function(results) {
                expect(results.length).toBe(1)

                var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)
                processor.process(function(err, actualResponse) {

                  sequelize.query('SELECT * FROM case_subscriptions')
                    .success(function(results) {
                      expect(results.length).toBe(0)
                      done()
                    })
                    .error(done)

                }) // END - processor.process

              }) // END - success
              .error(done)

          }) // END it - should remove subscription

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is negation

        describe('and message is a new case number', function() {

          var expectedNewCaseNumber = '11-CI-111111'
          var expectedInboundMessage = expectedNewCaseNumber
          var expectedOutboundMessage = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'

          it('should remove current case subscription and replace it with the new case subscription', function(done) {

            sequelize.query('SELECT * FROM case_subscriptions')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].case_id).toBe(1)
                expect(results[0].state).toBe('UNCONFIRMED')

                var processor = messageProcessor(userCellNumber, hermesNumber, expectedNewCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })
                processor.process(function(err, actualResponse) {

                  sequelize.query('SELECT * FROM case_subscriptions')
                    .success(function(results) {
                      expect(results.length).toBe(1)
                      expect(results[0].case_id).toBe(2)
                      expect(results[0].state).toBe('UNCONFIRMED')
                      done()
                    })
                    .error(done)

                }) // END - processor.process

              }) // END - success
              .error(done)

          }) // END it - should remove current case subscription and replace it with the new case subscription

          it ('should respond with subscription confirmation response for the new case', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedNewCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with subscription confirmation response for the new case

          it('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is a new case number

      }) // END describe - and subscription is UNCONFIRMED

      describe('and subscription is UNCONFIRMED_DELAYED', function() {

        var expectedCaseNumber = '13-T-663633'
        var expectedCaseTitle = 'COMMONWEALTH VS. DUCK, DONALD P'
        var expectedCaseNextCourtDateTime = new Date('5/18/2013 11:11')
        var fakeFetcher

        beforeEach(function(done) {

          fakeFetcher = fakeCaseDetailsFetcher()
            .setTitle(expectedCaseTitle)
            .setNextCourtDateTime(expectedCaseNextCourtDateTime)
            .build()

          models.contact.create({
            cell_number: userCellNumber
          })
            .success(function(c) {

              models.case.create({
                number: expectedCaseNumber,
                next_court_datetime: expectedCaseNextCourtDateTime
              })
                .success(function(k) {

                  models.case_subscription.create({
                    contact_id: c.id,
                    case_id: k.id,
                    state: 'UNCONFIRMED_DELAYED'
                  })
                    .success(function(cs) {
                      done()
                    }) // END - success case_subscription.create
                    .error(function(err) {
                      console.error(err)
                    })

                }) // END - success case.create
                .error(function(err) {
                  console.error(err)
                })

            }) // END - success contact.create
            .error(function(err) {
              console.error(err)
            })

        })

        describe('and message is a new case number', function() {

          var expectedNewCaseNumber = '11-CI-111111'
          var expectedInboundMessage = expectedNewCaseNumber
          var expectedOutboundMessage = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'

          it('should remove current case subscription and replace it with the new case subscription', function(done) {

            sequelize.query('SELECT * FROM case_subscriptions')
              .success(function(results) {
                expect(results.length).toBe(1)
                expect(results[0].case_id).toBe(1)
                expect(results[0].state).toBe('UNCONFIRMED_DELAYED')

                var processor = messageProcessor(userCellNumber, hermesNumber, expectedNewCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })
                processor.process(function(err, actualResponse) {

                  sequelize.query('SELECT * FROM case_subscriptions')
                    .success(function(results) {
                      expect(results.length).toBe(1)
                      expect(results[0].case_id).toBe(2)
                      expect(results[0].state).toBe('UNCONFIRMED')
                      done()
                    })
                    .error(done)

                }) // END - processor.process

              }) // END - success
              .error(done)

          }) // END it - should remove current case subscription and replace it with the new case subscription

          it ('should respond with subscription confirmation response for the new case', function(done) {

            var expectedOutboundMessage = 'This case is about ' + expectedCaseTitle + '. Is this the case you want us to remind you about? Text YES or NO.'
            var processor = messageProcessor(userCellNumber, hermesNumber, expectedNewCaseNumber, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with subscription confirmation response for the new case

          it('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null, { caseDetailsFetcher: fakeFetcher })
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is a new case number

      }) // END describe - and subscription is UNCONFIRMED_DELAYED

      describe('and subscription is SUBSCRIBED', function() {

        var expectedCaseNumber = '08-CR-000012'
        var expectedCaseTitle = 'COMMONWEALTH VS. TREE, PALM'
        var expectedDefendantName = 'Palm Tree'
        var expectedCaseNextCourtDateTime = new Date('4/17/2013 15:29')
        var fakeFetcher

        beforeEach(function(done) {

          fakeFetcher = fakeCaseDetailsFetcher()
            .setTitle(expectedCaseTitle)
            .setNextCourtDateTime(expectedCaseNextCourtDateTime)
            .build()

          models.contact.create({
            cell_number: userCellNumber
          })
            .success(function(c) {

              models.case.create({
                number: expectedCaseNumber,
                next_court_datetime: expectedCaseNextCourtDateTime
              })
                .success(function(k) {

                  models.case_subscription.create({
                    contact_id: c.id,
                    case_id: k.id,
                    state: 'SUBSCRIBED'
                  })
                    .success(function(cs) {
                      done()
                    }) // END - success case_subscription.create
                    .error(function(err) {
                      console.error(err)
                    })

                }) // END - success case.create
                .error(function(err) {
                  console.error(err)
                })

            }) // END - success contact.create
            .error(function(err) {
              console.error(err)
            })

        })

        describe('and message is a new case number', function() {

          var expectedNewCaseNumber = '11-CI-111111'
          var expectedInboundMessage = expectedNewCaseNumber
          var expectedOutboundMessages = [
            'You are already getting reminders about another court case, ' + expectedCaseNumber + ' (about ' + expectedDefendantName + '). You can\'t get reminders about more than one court case.',
            'To change the case you want to be reminded of, text S, wait for the confirmation, and then text the new case number.'
          ]

          xit ('should respond with subscription change messages', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponses) {
              expect(actualResponses instanceof Array).toBe(true)
              // expect(actualRespones.length).toBe(2)
              // expect(actualResponses[0]).toBe(expectedOutboundMessages[0])
              // expect(actualResponses[1]).toBe(expectedOutboundMessages[1])
              done()
            })

          }) // END it - should respond with subscription change messages

          xit('should save inbound message and outbound message (reply)', function(done) {
          }) // END it - should save inbound message and outbound message (reply)

          xit ('should save events for inbound and outbound message (reply)', function(done) {
          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is new case number

        describe('and message is unrecognized', function() {

          var expectedInboundMessage = 'abracadabra'
          var expectedOutboundMessage = 'Sorry, I didn\'t understand that. Please call ' + config.responses.clerkPhone + ' with questions.'

          it ('should respond with unrecognized message response', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              expect(actualResponse).toBe(expectedOutboundMessage)
              done()
            })

          }) // END it - should respond with unrecognized message response

          it ('should save inbound message and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)

            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM messages')
                .success(function(results) {
                  expect(results.length).toBe(2)

                  expect(results[0].sender).toBe(userCellNumber)
                  expect(results[0].recipient).toBe(hermesNumber)
                  expect(results[0].body).toBe(expectedInboundMessage)
                  expect(results[0].contact_id).not.toBe(null)
                  expect(results[0].case_id).not.toBe(null)

                  expect(results[1].sender).toBe(hermesNumber)
                  expect(results[1].recipient).toBe(userCellNumber)
                  expect(results[1].body).toBe(expectedOutboundMessage)
                  expect(results[1].contact_id).not.toBe(null)
                  expect(results[1].case_id).not.toBe(null)

                  done()
                })
                .error(done)
            })

          }) // END it - should save inbound message and outbound message (reply)

          it ('should save events for inbound and outbound message (reply)', function(done) {

            var processor = messageProcessor(userCellNumber, hermesNumber, expectedInboundMessage, null, null)
            processor.process(function(err, actualResponse) {
              sequelize.query('SELECT * FROM events')
                .success(function(results) {

                  expect(results.length).toBe(2)

                  expect(results[0].type).toBe(models.event.types().SMS_INBOUND)
                  var data = JSON.parse(results[0].data)
                  expect(data.message).toBe(expectedInboundMessage)

                  expect(results[1].type).toBe(models.event.types().SMS_OUTBOUND)
                  data = JSON.parse(results[1].data)
                  expect(data.message).toBe(expectedOutboundMessage)

                  done()

                })
                .error(done)
            })

          }) // END it - should save events for inbound and outbound message (reply)

        }) // END describe - and message is unrecognized

      }) // END describe - and subscription is SUBSCRIBED

    }) // END describe - where contact has a subscription

  }) // END describe - for process

}) // END describe - Message Processor
