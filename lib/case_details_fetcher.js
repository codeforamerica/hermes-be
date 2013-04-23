/* jshint -W024 */ // For the use of 'case'
var request = require('request'),
    dateUtils = require('date-utils'),
    cheerio = require('cheerio'),
    formData = require('../templates/case-search-formdata.json'),
    models = require('../models')

module.exports = function(caseNumber) {

  caseNumber = caseNumber.trim()

  var URL_SEARCH_PAGE = 'http://kcoj.kycourts.net/CourtRecords/Search.aspx'
  var URL_SEARCH_RESULTS_PAGE = 'http://kcoj.kycourts.net/CourtRecords/Results.aspx'

  var parseSearchResults = function(body) {

    var caseDetails = {
      title: null,
      nextCourtDateTime: null,
      nextCourtLocation: null
    }

    var $ = cheerio.load(body)

    // Parse case title
    var title = $('div[class="dataTitle"]')
    if (title && (title.length > 0)) {
      caseDetails.title = title.text().trim()

      // Parse defendant first name and last name
      var defendantName = models.case.parseDefendantName(caseDetails.title)
      if (defendantName) {
        caseDetails.defendantFirstName = defendantName.firstName
        caseDetails.defendantMiddleName = defendantName.middleName
        caseDetails.defendantLastName = defendantName.lastName
      }

    }

    // Parse next court date/time + location
    var events = $('span[class="itemEvent"]').parent().children()
    if (events && (events.length > 0)) {

      // Set next date/time
      var nextDateTime = $(events[1]).text().trim().match(/([0-9\/]+)\s+([0-9]+)\:([0-9]+)\s+(AM|PM)/)
      caseDetails.nextCourtDateTime = new Date(nextDateTime[1])
      caseDetails.nextCourtDateTime.setHours((nextDateTime[4] == 'AM') ? parseInt(nextDateTime[2], 10) : parseInt(nextDateTime[2], 10) + 12)
      caseDetails.nextCourtDateTime.setMinutes(parseInt(nextDateTime[3], 10))

      // Set next location
      caseDetails.nextCourtLocation = $(events[2]).text().trim()
    }

    return caseDetails

  } // END function - parseSearchResults

  var getForm = function() {

    var CASE_NUMBER_FIELD_NAME = 'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$tb_CS_case_number'
    formData[CASE_NUMBER_FIELD_NAME] = caseNumber
    return formData

  }

  var fetchSearchResults = function(cb) {

    var options = {
      uri: URL_SEARCH_PAGE,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31'
      },
      form: getForm()
    }

    request(options, function(err, response, body) {

      if (err) {
        cb(err)
      }

      else {

        if (response.statusCode == 200) {
          request(URL_SEARCH_RESULTS_PAGE, function(err, response, body) {

            if (err) {
              cb(err)
            }

            else {
              if (response.statusCode == 200) {
                cb(null, parseSearchResults(body))
              }

              else {
                cb('Could not fetch search results successfully.')
              }

            }

          })
        } else {
          cb('Could not submit search form successfully.')
        }

      }

    })

  } // END function - fetchSearchResults

  return {

    fetch: fetchSearchResults

  } // END - public object

} // END - module.exports

