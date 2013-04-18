var models = require('../../models')

describe("Contact model", function() {

  describe("for isValidCellNumber", function() {

    it ("should return true if 7-digit phone number is given", function() {
      expect(models.contact.isValidNumber('2345679')).toBe(true)
    })

    it ("should return true if 10-digit phone number is given", function() {
      expect(models.contact.isValidNumber('1232345679')).toBe(true)
    })

    it ("should return true if 11-digit phone number is given", function() {
      expect(models.contact.isValidNumber('11232345679')).toBe(true)
    })

    it ("should return true if phone number is prefixed with + sign", function() {
      expect(models.contact.isValidNumber('+11232345679')).toBe(true)
    })

    it ("should return true if phone number contains dashes", function() {
      expect(models.contact.isValidNumber('203-145-6790')).toBe(true)
    })

    it ("should return false if phone number is other than 7, 10 or 11 digits long", function() {
      expect(models.contact.isValidNumber('203-145-679')).toBe(false)
    })

  }) // END describe - for isValidCellNumber

  describe("for normalizeCellNumber", function() {

    it ("should return number without dashes if phone number with dashes is given", function() {
      expect(models.contact.normalizeCellNumber('123-4569')).toBe('1234569')
    })

    it ("should return number with leading +1 if 10-digit phone number is given", function() {
      expect(models.contact.normalizeCellNumber('405-123-4569')).toBe('+14051234569')
    })

    it ("should return number with leading + if 11-digit phone number with leading 1 is given", function() {
      expect(models.contact.normalizeCellNumber('1 (405) 123-4569')).toBe('+14051234569')
    })

  }) // END describe - for normalizeCellNumber

}) // END describe - for Contact model
