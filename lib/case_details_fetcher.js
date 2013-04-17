var request = require('request'),
    dateUtils = require('date-utils'),
    cheerio = require('cheerio')

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

module.exports = function(caseNumber) {

  var caseNumber = caseNumber.trim()

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
      var nameMatches = caseDetails.title.match(/COMMONWEALTH\s+VS.\s+(\S+),\s+(\S+)(\s+(\S+))?/)
      if (nameMatches && (nameMatches.length > 1)) {
        caseDetails.defendantFirstName = nameMatches[2] ? nameMatches[2].toProperCase() : null
        caseDetails.defendantMiddleName = nameMatches[4] ? nameMatches[4].toProperCase() : null
        caseDetails.defendantLastName = nameMatches[1] ? nameMatches[1].toProperCase() : null
      }

    }

    // Parse next court date/time + location
    var events = $('span[class="itemEvent"]').parent().children()
    if (events && (events.length > 0)) {

      // Set next date/time
      var nextDateTime = $(events[1]).text().trim().match(/([0-9\/]+)\s+([0-9]+)\:([0-9]+)\s+(AM|PM)/)
      caseDetails.nextCourtDateTime = new Date(nextDateTime[1])
      caseDetails.nextCourtDateTime.setHours((nextDateTime[4] == 'AM') ? parseInt(nextDateTime[2]) : parseInt(nextDateTime[2]) + 12)
      caseDetails.nextCourtDateTime.setMinutes(parseInt(nextDateTime[3]))

      // Set next location
      caseDetails.nextCourtLocation = $(events[2]).text().trim()
    }

    return caseDetails

  } // END function - parseSearchResults

  // TODO: Use mustache
  var getForm = function() {

    return { 'ctl00$ContentPlaceHolder_Content$ScriptManager1': 'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$UpdatePanel_SearchCase|ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$btn_CS_search',
             __LASTFOCUS: '',
             ctl00_ContentPlaceHolder_Content_tab_container_search_ClientState: '{"ActiveTabIndex":1,"TabState":[true,true,true]}',
             __EVENTTARGET: 'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$btn_CS_search',
             __EVENTARGUMENT: '',
             __VIEWSTATE: '/wEPDwUKMTI4OTA1MTU5Nw9kFgJmD2QWAgIDD2QWAgIDD2QWAgIDD2QWBmYPZBYCAgEPZBYCAgEPZBYCZg9kFgICAQ8WAh4Kb25LZXlQcmVzcwVwcmV0dXJuIEtleVByZXNzUG9zdEJhY2soZXZlbnQsICdjdGwwMCRDb250ZW50UGxhY2VIb2xkZXJfQ29udGVudCR0YWJfY29udGFpbmVyX3NlYXJjaCR0YWJfcGFydHkkYnRuX1BTX3NlYXJjaCcpOxYIAgEPFgIeBXN0eWxlBQ1kaXNwbGF5Om5vbmU7ZAIDDxAPFggeCkRhdGFNZW1iZXIFCFhfQ291bnR5Hg1EYXRhVGV4dEZpZWxkBQtkZXNjcmlwdGlvbh4ORGF0YVZhbHVlRmllbGQFBGNvZGUeC18hRGF0YUJvdW5kZ2QQFXkJU3RhdGV3aWRlBUFEQUlSBUFMTEVOCEFOREVSU09OB0JBTExBUkQGQkFSUkVOBEJBVEgEQkVMTAVCT09ORQdCT1VSQk9OBEJPWUQFQk9ZTEUHQlJBQ0tFTglCUkVBVEhJVFQMQlJFQ0tJTlJJREdFB0JVTExJVFQGQlVUTEVSCENBTERXRUxMCENBTExPV0FZCENBTVBCRUxMCENBUkxJU0xFB0NBUlJPTEwGQ0FSVEVSBUNBU0VZCUNIUklTVElBTgVDTEFSSwRDTEFZB0NMSU5UT04KQ1JJVFRFTkRFTgpDVU1CRVJMQU5EB0RBVklFU1MIRURNT05TT04HRUxMSU9UVAZFU1RJTEwHRkFZRVRURQdGTEVNSU5HBUZMT1lECEZSQU5LTElOBkZVTFRPTghHQUxMQVRJTgdHQVJSQVJEBUdSQU5UBkdSQVZFUwdHUkFZU09OBUdSRUVOB0dSRUVOVVAHSEFOQ09DSwZIQVJESU4GSEFSTEFOCEhBUlJJU09OBEhBUlQJSEVOREVSU09OBUhFTlJZB0hJQ0tNQU4HSE9QS0lOUwdKQUNLU09OCUpFRkZFUlNPTglKRVNTQU1JTkUHSk9ITlNPTgZLRU5UT04FS05PVFQES05PWAVMQVJVRQZMQVVSRUwITEFXUkVOQ0UDTEVFBkxFU0xJRQdMRVRDSEVSBUxFV0lTB0xJTkNPTE4KTElWSU5HU1RPTgVMT0dBTgRMWU9OCU1DQ1JBQ0tFTghNQ0NSRUFSWQZNQ0xFQU4HTUFESVNPTghNQUdPRkZJTgZNQVJJT04ITUFSU0hBTEwGTUFSVElOBU1BU09OBU1FQURFB01FTklGRUUGTUVSQ0VSCE1FVENBTEZFBk1PTlJPRQpNT05UR09NRVJZBk1PUkdBTgpNVUhMRU5CRVJHBk5FTFNPTghOSUNIT0xBUwRPSElPBk9MREhBTQRPV0VOBk9XU0xFWQlQRU5ETEVUT04FUEVSUlkEUElLRQZQT1dFTEwHUFVMQVNLSQlST0JFUlRTT04KUk9DS0NBU1RMRQVST1dBTgdSVVNTRUxMBVNDT1RUBlNIRUxCWQdTSU1QU09OB1NQRU5DRVIGVEFZTE9SBFRPREQFVFJJR0cHVFJJTUJMRQVVTklPTgZXQVJSRU4KV0FTSElOR1RPTgVXQVlORQdXRUJTVEVSB1dISVRMRVkFV09MRkUIV09PREZPUkQVeQEwAzAwMQMwMDIDMDAzAzAwNAMwMDUDMDA2AzAwNwMwMDgDMDA5AzAxMAMwMTEDMDEyAzAxMwMwMTQDMDE1AzAxNgMwMTcDMDE4AzAxOQMwMjADMDIxAzAyMgMwMjMDMDI0AzAyNQMwMjYDMDI3AzAyOAMwMjkDMDMwAzAzMQMwMzIDMDMzAzAzNAMwMzUDMDM2AzAzNwMwMzgDMDM5AzA0MAMwNDEDMDQyAzA0MwMwNDQDMDQ1AzA0NgMwNDcDMDQ4AzA0OQMwNTADMDUxAzA1MgMwNTMDMDU0AzA1NQMwNTYDMDU3AzA1OAMwNTkDMDYwAzA2MQMwNjIDMDYzAzA2NAMwNjUDMDY2AzA2NwMwNjgDMDY5AzA3MAMwNzEDMDcyAzA3MwMwNzQDMDc1AzA3NgMwNzcDMDc4AzA3OQMwODADMDgxAzA4MgMwODMDMDg0AzA4NQMwODYDMDg3AzA4OAMwODkDMDkwAzA5MQMwOTIDMDkzAzA5NAMwOTUDMDk2AzA5NwMwOTgDMDk5AzEwMAMxMDEDMTAyAzEwMwMxMDQDMTA1AzEwNgMxMDcDMTA4AzEwOQMxMTADMTExAzExMgMxMTMDMTE0AzExNQMxMTYDMTE3AzExOAMxMTkDMTIwFCsDeWdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dkZAIHDxAPFggfAgUJQ2FzZVR5cGVzHwMFC2Rlc2NyaXB0aW9uHwQFBGNvZGUfBWdkEBUECUFMTCBDQVNFUwtDSVZJTCBDQVNFUw5DUklNSU5BTCBDQVNFUxFET01FU1RJQyBWSU9MRU5DRRUEATUBMgExATMUKwMEZ2dnZ2RkAgkPEA8WCB8CBQpQYXJ0eVR5cGVzHwMFC2Rlc2NyaXB0aW9uHwQFBGNvZGUfBWdkEBUEC0FMTCBQQVJUSUVTCEFUVE9STkVZCURFRkVOREFOVAlQTEFJTlRJRkYVBAE0ATEBMgEzFCsDBGdnZ2dkZAIBD2QWAgIBD2QWAgIBD2QWAmYPZBYCAgEPFgIfAAVvcmV0dXJuIEtleVByZXNzUG9zdEJhY2soZXZlbnQsICdjdGwwMCRDb250ZW50UGxhY2VIb2xkZXJfQ29udGVudCR0YWJfY29udGFpbmVyX3NlYXJjaCR0YWJfY2FzZSRidG5fQ1Nfc2VhcmNoJyk7FggCAQ8WAh8BBQ1kaXNwbGF5Om5vbmU7ZAIDDxAPFggfAgUIWF9Db3VudHkfAwULZGVzY3JpcHRpb24fBAUEY29kZR8FZ2QQFXgFQURBSVIFQUxMRU4IQU5ERVJTT04HQkFMTEFSRAZCQVJSRU4EQkFUSARCRUxMBUJPT05FB0JPVVJCT04EQk9ZRAVCT1lMRQdCUkFDS0VOCUJSRUFUSElUVAxCUkVDS0lOUklER0UHQlVMTElUVAZCVVRMRVIIQ0FMRFdFTEwIQ0FMTE9XQVkIQ0FNUEJFTEwIQ0FSTElTTEUHQ0FSUk9MTAZDQVJURVIFQ0FTRVkJQ0hSSVNUSUFOBUNMQVJLBENMQVkHQ0xJTlRPTgpDUklUVEVOREVOCkNVTUJFUkxBTkQHREFWSUVTUwhFRE1PTlNPTgdFTExJT1RUBkVTVElMTAdGQVlFVFRFB0ZMRU1JTkcFRkxPWUQIRlJBTktMSU4GRlVMVE9OCEdBTExBVElOB0dBUlJBUkQFR1JBTlQGR1JBVkVTB0dSQVlTT04FR1JFRU4HR1JFRU5VUAdIQU5DT0NLBkhBUkRJTgZIQVJMQU4ISEFSUklTT04ESEFSVAlIRU5ERVJTT04FSEVOUlkHSElDS01BTgdIT1BLSU5TB0pBQ0tTT04JSkVGRkVSU09OCUpFU1NBTUlORQdKT0hOU09OBktFTlRPTgVLTk9UVARLTk9YBUxBUlVFBkxBVVJFTAhMQVdSRU5DRQNMRUUGTEVTTElFB0xFVENIRVIFTEVXSVMHTElOQ09MTgpMSVZJTkdTVE9OBUxPR0FOBExZT04JTUNDUkFDS0VOCE1DQ1JFQVJZBk1DTEVBTgdNQURJU09OCE1BR09GRklOBk1BUklPTghNQVJTSEFMTAZNQVJUSU4FTUFTT04FTUVBREUHTUVOSUZFRQZNRVJDRVIITUVUQ0FMRkUGTU9OUk9FCk1PTlRHT01FUlkGTU9SR0FOCk1VSExFTkJFUkcGTkVMU09OCE5JQ0hPTEFTBE9ISU8GT0xESEFNBE9XRU4GT1dTTEVZCVBFTkRMRVRPTgVQRVJSWQRQSUtFBlBPV0VMTAdQVUxBU0tJCVJPQkVSVFNPTgpST0NLQ0FTVExFBVJPV0FOB1JVU1NFTEwFU0NPVFQGU0hFTEJZB1NJTVBTT04HU1BFTkNFUgZUQVlMT1IEVE9ERAVUUklHRwdUUklNQkxFBVVOSU9OBldBUlJFTgpXQVNISU5HVE9OBVdBWU5FB1dFQlNURVIHV0hJVExFWQVXT0xGRQhXT09ERk9SRBV4AzAwMQMwMDIDMDAzAzAwNAMwMDUDMDA2AzAwNwMwMDgDMDA5AzAxMAMwMTEDMDEyAzAxMwMwMTQDMDE1AzAxNgMwMTcDMDE4AzAxOQMwMjADMDIxAzAyMgMwMjMDMDI0AzAyNQMwMjYDMDI3AzAyOAMwMjkDMDMwAzAzMQMwMzIDMDMzAzAzNAMwMzUDMDM2AzAzNwMwMzgDMDM5AzA0MAMwNDEDMDQyAzA0MwMwNDQDMDQ1AzA0NgMwNDcDMDQ4AzA0OQMwNTADMDUxAzA1MgMwNTMDMDU0AzA1NQMwNTYDMDU3AzA1OAMwNTkDMDYwAzA2MQMwNjIDMDYzAzA2NAMwNjUDMDY2AzA2NwMwNjgDMDY5AzA3MAMwNzEDMDcyAzA3MwMwNzQDMDc1AzA3NgMwNzcDMDc4AzA3OQMwODADMDgxAzA4MgMwODMDMDg0AzA4NQMwODYDMDg3AzA4OAMwODkDMDkwAzA5MQMwOTIDMDkzAzA5NAMwOTUDMDk2AzA5NwMwOTgDMDk5AzEwMAMxMDEDMTAyAzEwMwMxMDQDMTA1AzEwNgMxMDcDMTA4AzEwOQMxMTADMTExAzExMgMxMTMDMTE0AzExNQMxMTYDMTE3AzExOAMxMTkDMTIwFCsDeGdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2RkAggPFgQeC29ubW91c2VvdmVyBWdkaXNwbGF5SW5mbygnY3RsMDBfQ29udGVudFBsYWNlSG9sZGVyX0NvbnRlbnRfdGFiX2NvbnRhaW5lcl9zZWFyY2hfdGFiX2Nhc2Vfc2VjdGlvbl9pbmZvX2Nhc2VfbnVtYmVyJyk7Hgpvbm1vdXNlb3V0BWRoaWRlSW5mbygnY3RsMDBfQ29udGVudFBsYWNlSG9sZGVyX0NvbnRlbnRfdGFiX2NvbnRhaW5lcl9zZWFyY2hfdGFiX2Nhc2Vfc2VjdGlvbl9pbmZvX2Nhc2VfbnVtYmVyJyk7ZAIKDxYCHwEFgQFiYWNrZ3JvdW5kLWNvbG9yOiNGRkZGRTE7cGFkZGluZzo1cHg7ei1pbmRleDoxMDA7Ym9yZGVyOnNvbGlkIDFweCBibGFjaztwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxNTBweDtmb250LXNpemU6OHB0O2Rpc3BsYXk6bm9uZTtkAgIPZBYCAgEPZBYCAgEPZBYCZg9kFgICAQ8WAh8ABXdyZXR1cm4gS2V5UHJlc3NQb3N0QmFjayhldmVudCwgJ2N0bDAwJENvbnRlbnRQbGFjZUhvbGRlcl9Db250ZW50JHRhYl9jb250YWluZXJfc2VhcmNoJHRhYl9jaXRhdGlvbiRidG5DaXRhdGlvblNlYXJjaCcpOxYEAgMPEGQPFgpmAgECAgIDAgQCBQIGAgcCCAIJFgoQBQIxMwUBM2cQBQIxMgUBMmcQBQIxMQUBMWcQBQIxMAUBMGcQBQIwOQUBOWcQBQIwOAUBOGcQBQIwNwUBN2cQBQIwNgUBNmcQBQIwNQUBNWcQBQIwNAUBNGdkZAIHDxBkDxYKZgIBAgICAwIEAgUCBgIHAggCCRYKEAUBMAUBMGcQBQExBQExZxAFATIFATJnEAUBMwUBM2cQBQE0BQE0ZxAFATUFATVnEAUBNgUBNmcQBQE3BQE3ZxAFATgFAThnEAUBOQUBOWdkZBgCBR5fX0NvbnRyb2xzUmVxdWlyZVBvc3RCYWNrS2V5X18WAQU1Y3RsMDAkQ29udGVudFBsYWNlSG9sZGVyX0NvbnRlbnQkdGFiX2NvbnRhaW5lcl9zZWFyY2gFNWN0bDAwJENvbnRlbnRQbGFjZUhvbGRlcl9Db250ZW50JHRhYl9jb250YWluZXJfc2VhcmNoDw9kAgFkfC3PAAef1DYREc402aJp8FnmDSEVPYrAx8z1rmZSwm8=',
             __EVENTVALIDATION: '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',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$cmb_PS_county': '0',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$cmb_PS_division': 'ALL',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$cmb_PS_case_type': '5',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$cmb_PS_party_type': '2',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$tb_PS_last_name': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$tb_PS_first_name': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$tb_PS_dob': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$tb_PS_dln': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$tb_PS_event_from': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_party$tb_PS_event_to': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$cmb_CS_county': '056',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$cmb_CS_division': 'ALL',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_case$tb_CS_case_number': caseNumber,
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_citation$cmb_citation_year': '3',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_citation$tb_XS_citation_number': '',
             'ctl00$ContentPlaceHolder_Content$tab_container_search$tab_citation$cmb_citation_type': '1',
             __ASYNCPOST: 'true' }

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

