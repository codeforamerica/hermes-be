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

  }) // END describe - for normalizeCellNumber

}) // END describe - for Contact model
