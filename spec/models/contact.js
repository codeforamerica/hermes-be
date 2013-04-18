var models = require('../../models')

describe("Contact model", function() {

  describe("for isValidCellNumber", function() {

    it ("should return true if 7-digit phone number is given", function() {
      expect(models.contact.isValidNumber('2345679')).toBe(true)
    })

  }) // END describe - for isValidCellNumber

  describe("for normalizeCellNumber", function() {


  }) // END describe - for normalizeCellNumber

}) // END describe - for Contact model
