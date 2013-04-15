var request = require('request'),
    cheerio = require('cheerio')

module.exports = function(caseNumber, cb) {

  request('http://kcoj.kycourts.net/CourtRecords/Search.aspx', function(err, response, body) {

    if (err) {
      cb(err, null)
    }

    else if (response.statusCode != 200) {
      cb('Could not fetch search page.', null)
    }

    else {
      
      cb(null, body)

    }

  }) // END - request

} // END - module.exports


