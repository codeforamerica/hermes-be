var fetcher = require('../../lib/case_details_fetcher.js')

describe("Case Details Fetcher", function() {

  it ("should fetch the search form page", function(done) {
    
    fetcher("13-T-000001", function(err, details) {
      done()
    })
    
  })

})
