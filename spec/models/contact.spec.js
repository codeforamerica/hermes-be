var models = require('../../models'),
    config = require('config')

describe('Contact model', function() {

  describe('for isValidCellNumber', function() {

    it ('should return true if 7-digit phone number is given', function() {
      expect(models.contact.isValidCellNumber('2345679')).toBe(true)
    })

    it ('should return true if 10-digit phone number is given', function() {
      expect(models.contact.isValidCellNumber('1232345679')).toBe(true)
    })

    it ('should return true if 11-digit phone number is given', function() {
      expect(models.contact.isValidCellNumber('11232345679')).toBe(true)
    })

    it ('should return true if phone number is prefixed with + sign', function() {
      expect(models.contact.isValidCellNumber('+11232345679')).toBe(true)
    })

    it ('should return true if phone number contains dashes', function() {
      expect(models.contact.isValidCellNumber('203-145-6790')).toBe(true)
    })

    it ('should return false if phone number is other than 7, 10 or 11 digits long', function() {
      expect(models.contact.isValidCellNumber('203-145-679')).toBe(false)
    })

    it ('should return false if phone number is undefined', function() {
      expect(models.contact.isValidCellNumber()).toBe(false)
    })

  }) // END describe - for isValidCellNumber

  describe('for normalizeCellNumber', function() {

    it ('should return number without dashes if phone number with dashes is given', function() {
      expect(models.contact.normalizeCellNumber('123-4569')).toBe('+1' + config.misc.cellPhoneAreaCode + '1234569')
    })

    it ('should return number with leading +1 if 10-digit phone number is given', function() {
      expect(models.contact.normalizeCellNumber('405-123-4569')).toBe('+14051234569')
    })

    it ('should return number with leading + if 11-digit phone number with leading 1 is given', function() {
      expect(models.contact.normalizeCellNumber('1 (405) 123-4569')).toBe('+14051234569')
    })

    it ('should add area code if missing', function() {
      expect(models.contact.normalizeCellNumber('923.3822')).toBe('+1' + config.misc.cellPhoneAreaCode + '9233822')
    })

  }) // END describe - for normalizeCellNumber

}) // END describe - for Contact model
