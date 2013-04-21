/* jshint -W117 */ // For undeclared symbols like 'describe', 'it' and 'expect'
var util = require('../../lib/util.js')

describe('Utilities', function() {

  describe('for handleError', function() {

    it ('should be able to call success callbacks that do not take arguments', function() {

      var start = function(cb) {
        cb()
      }

      var next = function(cb) {
        start(util.handleError(cb, function() {
          expect(true).toBe(true)
        }))
      }

      next(function(err) {
        throw 'Test execution should not have reached this line. Test failed.'
      })

    })

    it ('should be able to call success callbacks that take 1 argument', function() {

      var start = function(cb) {
        cb(null, 'foobar')
      }

      var next = function(cb) {
        start(util.handleError(cb, function(arg) {
          expect(arg).toBe('foobar')
        }))
      }

      next(function(err) {
        throw 'Test execution should not have reached this line. Test failed.'
      })

    })

    it ('should be able to call success callbacks that take multiple arguments', function() {

      var start = function(cb) {
        cb(null, 'foo', [ 'bar' ], null, { crap: 'baz' })
      }

      var next = function(cb) {
        start(util.handleError(cb, function(arg1, arg2, arg3, arg4) {
          expect(arg1).toBe('foo')
          expect(arg2[0]).toBe('bar')
          expect(arg3).toBe(null)
          expect(arg4.crap).toBe('baz')
        }))
      }

      next(function(err) {
        throw 'Test execution should not have reached this line. Test failed.'
      })

    })

    it ('should be able to call error callbacks', function() {

      var start = function(cb) {
        cb('some error')
      }

      var next = function(cb) {
        start(util.handleError(cb, function() {
          throw 'Test execution should not have reached this line. Test failed.'

        }))
      }

      next(function(err) {
        expect(err).toBe('some error')
      })

    })

    it ('should be able to call error callbacks even when success arguments are present', function() {

      var start = function(cb) {
        cb('some error', 'foobar')
      }

      var next = function(cb) {
        start(util.handleError(cb, function(arg) {
          throw 'Test execution should not have reached this line. Test failed.'
        }))
      }

      next(function(err) {
        expect(err).toBe('some error')
      })

    })

  }) // END describe - for handleError

}) // END describe - Utilities
