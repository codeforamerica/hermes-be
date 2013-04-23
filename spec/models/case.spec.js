/* jshint -W024 */ // For the use of 'case'
/* jshint -W117 */ // For undeclared symbols like 'describe', 'it' and 'expect'
var models = require('../../models')

describe('Case model', function() {

  describe('for isValidCaseNumber', function() {

    it ('should return false if case number is empty', function() {
      expect(models.case.isValidNumber('')).toBe(false)
    })

    it ('should return false if case number is undefined', function() {
      expect(models.case.isValidNumber()).toBe(false)
    })

    it ('should return true if case type is valid', function() {

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
      expect(models.case.isValidNumber('13-ad-123456')).toBe(true)
      expect(models.case.isValidNumber('13-c-123456')).toBe(true)
      expect(models.case.isValidNumber('13-ci-123456')).toBe(true)
      expect(models.case.isValidNumber('13-cr-123456')).toBe(true)
      expect(models.case.isValidNumber('13-d-123456')).toBe(true)
      expect(models.case.isValidNumber('13-f-123456')).toBe(true)
      expect(models.case.isValidNumber('13-h-123456')).toBe(true)
      expect(models.case.isValidNumber('13-j-123456')).toBe(true)
      expect(models.case.isValidNumber('13-m-123456')).toBe(true)
      expect(models.case.isValidNumber('13-p-123456')).toBe(true)
      expect(models.case.isValidNumber('13-s-123456')).toBe(true)
      expect(models.case.isValidNumber('13-t-123456')).toBe(true)
      expect(models.case.isValidNumber('13-xx-123456')).toBe(true)
      expect(models.case.isValidNumber('13-Ad-123456')).toBe(true)
      expect(models.case.isValidNumber('13-aD-123456')).toBe(true)
      expect(models.case.isValidNumber('13-Ci-123456')).toBe(true)
      expect(models.case.isValidNumber('13-cI-123456')).toBe(true)
      expect(models.case.isValidNumber('13-Cr-123456')).toBe(true)
      expect(models.case.isValidNumber('13-cR-123456')).toBe(true)
      expect(models.case.isValidNumber('13-Xx-123456')).toBe(true)
      expect(models.case.isValidNumber('13-xX-123456')).toBe(true)

    })

    // NOTE: This is not an exhaustive test
    it ('should return false if case type is invalid', function() {
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

  describe('for normalizeCaseNumber', function() {

    it ('should add leading 0 to year if it is a single digit', function() {
      expect(models.case.normalizeCaseNumber('8-T-000123')).toBe('08-T-000123')
    }) // END it - should add leading 0 to year if it is a single digit

    it ('should normalize 12CI7000 to 12-CI-007000', function() {
      expect(models.case.normalizeCaseNumber('12CI7000')).toBe('12-CI-007000')
    }) // END it - should normalize 12CI7000 to 12-CI-007000

  }) // END describe - for normalizeCaseNumber

  describe('for parseDefendantName (class method)', function() {

    it ('should parse when title is like COMMONWEALTH VS. <lastname>, <firstname> <middlename>', function() {

      var parsed = models.case.parseDefendantName('COMMONWEALTH VS. DOE, JOHN S')
      expect(parsed).not.toBe(false)
      expect(parsed.firstName).toBe('John')
      expect(parsed.middleName).toBe('S')
      expect(parsed.lastName).toBe('Doe')

    }) // END it - should parse when title is like COMMONWEALTH VS. <lastname>, <firstname> <middlename>

    it ('should parse names with spaces in the last name', function() {

      var parsed = models.case.parseDefendantName('COMMONWEALTH VS. MOHAMED EL MOUSTAPHA, EL MOOTA')
      expect(parsed).not.toBe(false)
      expect(parsed.firstName).toBe('El')
      expect(parsed.middleName).toBe('Moota')
      expect(parsed.lastName).toBe('Mohamed El Moustapha')

    }) // END it - should parse names with spaces in the last name

  }) // END describe - for parseDefendantName (class method)

  describe('for parseDefendantName (instance method)', function() {

    it ('should parse when title is like COMMONWEALTH VS. <lastname>, <firstname> <middlename>', function() {

      var kase = models.case.build({
        title: 'COMMONWEALTH VS. DOE, JOHN S'
      })

      var parsed = kase.parseDefendantName()
      expect(parsed).not.toBe(false)
      expect(parsed.firstName).toBe('John')
      expect(parsed.middleName).toBe('S')
      expect(parsed.lastName).toBe('Doe')

    }) // END it - should parse when title is like COMMONWEALTH VS. <lastname>, <firstname> <middlename>

  }) // END describe - for parseDefendantName (instance method)

})
