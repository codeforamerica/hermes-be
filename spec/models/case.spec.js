/* jshint -W024 */ // For the use of 'case'
var models = require('../../models')

describe("Case model", function() {

  describe("for isValidCaseNumber", function() {

    it ("should return false if case number is empty", function() {
      expect(models.case.isValidNumber('')).toBe(false)
    })

    it ("should return false if case number is undefined", function() {
      expect(models.case.isValidNumber()).toBe(false)
    })

    it ("should return true if case type is valid", function() {
      expect(models.case.isValidNumber('13-AD-123456')).toBe(true)
      expect(models.case.isValidNumber('13-C-123456')).toBe(true)
      expect(models.case.isValidNumber('13-CI-123456')).toBe(true)
      expect(models.case.isValidNumber('13-CR-123456')).toBe(true)
      expect(models.case.isValidNumber('13-D-123456')).toBe(true)
      expect(models.case.isValidNumber('13-F-123456')).toBe(true)
      expect(models.case.isValidNumber('13-H-123456')).toBe(true)
      expect(models.case.isValidNumber('13-J-123456')).toBe(true)
      expect(models.case.isValidNumber('13-M-123456')).toBe(true)
      expect(models.case.isValidNumber('13-P-123456')).toBe(true)
      expect(models.case.isValidNumber('13-S-123456')).toBe(true)
      expect(models.case.isValidNumber('13-T-123456')).toBe(true)
      expect(models.case.isValidNumber('13-XX-123456')).toBe(true)
    })
    
    // NOTE: This is not an exhaustive test
    it ("should return false if case type is invalid", function() {
      expect(models.case.isValidNumber('13-A-123456')).toBe(false)
      expect(models.case.isValidNumber('13-B-123456')).toBe(false)
      expect(models.case.isValidNumber('13-E-123456')).toBe(false)
      expect(models.case.isValidNumber('13-G-123456')).toBe(false)
      expect(models.case.isValidNumber('13-I-123456')).toBe(false)
      expect(models.case.isValidNumber('13-K-123456')).toBe(false)
      expect(models.case.isValidNumber('13-L-123456')).toBe(false)
      expect(models.case.isValidNumber('13-N-123456')).toBe(false)
      expect(models.case.isValidNumber('13-O-123456')).toBe(false)
      expect(models.case.isValidNumber('13-Q-123456')).toBe(false)
      expect(models.case.isValidNumber('13-R-123456')).toBe(false)
      expect(models.case.isValidNumber('13-U-123456')).toBe(false)
      expect(models.case.isValidNumber('13-V-123456')).toBe(false)
      expect(models.case.isValidNumber('13-W-123456')).toBe(false)
      expect(models.case.isValidNumber('13-X-123456')).toBe(false)
      expect(models.case.isValidNumber('13-Y-123456')).toBe(false)
      expect(models.case.isValidNumber('13-Z-123456')).toBe(false)
      expect(models.case.isValidNumber('13-AA-123456')).toBe(false)
      expect(models.case.isValidNumber('13-CA-123456')).toBe(false)
      expect(models.case.isValidNumber('13-XA-123456')).toBe(false)
      expect(models.case.isValidNumber('13-ZD-123456')).toBe(false)
      expect(models.case.isValidNumber('13-ZI-123456')).toBe(false)
      expect(models.case.isValidNumber('13-ZR-123456')).toBe(false)
      expect(models.case.isValidNumber('13-ZX-123456')).toBe(false)
    })

  }) // END describe - for isValidCaseNumber

  describe("for normalizeCaseNumber", function() {

    it ("should add leading 0 to year if it is a single digit", function() {
      expect(models.case.normalizeCaseNumber("8-T-000123")).toBe('08-T-000123')
    }) // END it - should add leading 0 to year if it is a single digit
    
  }) // END describe - for normalizeCaseNumber

})
