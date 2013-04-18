var models = require('../../models')

describe("Case model", function() {

  describe("for isValidCaseNumber", function() {

    it ("should return false if case number is empty", function() {
      expect(models.case.isValidNumber('')).toBe(false)
    })

    it ("should return false if case number is undefined", function() {
      expect(models.case.isValidNumber()).toBe(false)
    })

  }) // END describe - for isValidCaseNumber

  describe("for normalizeCaseNumber", function() {

    it ("should add leading 0 to year if it is a single digit", function() {
      expect(models.case.normalizeCaseNumber("8-T-000123")).toBe('08-T-000123')
    }) // END it - should add leading 0 to year if it is a single digit
    
  }) // END describe - for normalizeCaseNumber

})
