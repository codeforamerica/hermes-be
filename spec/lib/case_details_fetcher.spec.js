var caseDetailsFetcher = require('../../lib/case_details_fetcher.js')

describe('Case Details Fetcher', function() {

  it ('should return no case details for an nonexistent case number', function(done) {

    var fetcher = caseDetailsFetcher('19-T-999999')
    fetcher.fetch(function(err, details) {
      expect(err).toBe(null)
      expect(details.title).toBe(null)
      expect(details.nextCourtDateTime).toBe(null)
      expect(details.nextCourtLocation).toBe(null)
      done()
    })

  })

  it ('should fetch case details with next appearance info', function(done) {
        
    var fetcher = caseDetailsFetcher('13-T-000001')
    fetcher.fetch(function(err, details) {
      expect(err).toBe(null)
      expect(details.title).toBe('COMMONWEALTH VS. CATTAN, JOSEPH RAY')
      expect(details.defendantFirstName).toBe('Joseph')
      expect(details.defendantMiddleName).toBe('Ray')
      expect(details.defendantLastName).toBe('Cattan')
      expect(details.nextCourtDateTime.getFullYear()).toBe(2013)
      expect(details.nextCourtDateTime.getMonth()).toBe(4 - 1)
      expect(details.nextCourtDateTime.getDate()).toBe(22)
      expect(details.nextCourtDateTime.getHours()).toBe(9)
      expect(details.nextCourtDateTime.getMinutes()).toBe(0)
      expect(details.nextCourtLocation).toBe('HJ302')
      done()
    })
    
  })
  
  it ('should fetch case details without next appearance info', function(done) {
    
    var fetcher = caseDetailsFetcher('13-F-000002')
    fetcher.fetch(function(err, details) {
      expect(err).toBe(null)
      expect(details.title).toBe('COMMONWEALTH VS. WILLIAMS, MARCUS DESHUN')
      expect(details.nextCourtDateTime).toBe(null)
      expect(details.nextCourtLocation).toBe(null)
      done()
    })

  })
  
  it ('should fetch case details without defendant middle name', function(done) {
        
    var fetcher = caseDetailsFetcher('06-CR-004115')
    fetcher.fetch(function(err, details) {
      expect(err).toBe(null)
      expect(details.title).toBe('COMMONWEALTH VS. SMITH, WILLIAM')
      expect(details.defendantFirstName).toBe('William')
      expect(details.defendantMiddleName).toBe(null)
      expect(details.defendantLastName).toBe('Smith')
      done()
    })
    
  })

  
})
