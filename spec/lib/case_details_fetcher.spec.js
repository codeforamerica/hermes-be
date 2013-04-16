var caseDetailsFetcher = require('../../lib/case_details_fetcher.js')

describe("Case Details Fetcher", function() {

  it ("should fetch the search form page", function(done) {
    
    var fetcher = caseDetailsFetcher("13-T-000001")
    fetcher.fetch(function(err, details) {
      expect(details.title).toBe('COMMONWEALTH VS. CATTAN, JOSEPH RAY')
      expect(details.nextCourtLocation).toBe('HJ302')
      done()
    })
    
  })

})
