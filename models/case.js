var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    sprintf = require('sprintf').sprintf,
    Contact = require('./contact.js'),
    Message = require('./message.js')

var CASE_NUMBER_REGEXP = /(\d{1,2})-?(AD|C|CI|CR|D|F|H|J|M|P|S|T|XX)-?(\d{1,6})-?(\d{0,2}[1-9])?/i

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
}

var parseCaseNumber = function(caseNumber) {

  var matches = caseNumber.match(CASE_NUMBER_REGEXP)

  return {
    year: parseInt(matches[1], 10),
    type: matches[2].toUpperCase(),
    serial: parseInt(matches[3], 10),
    defendant: matches[4]
  }

}

var parseDefendantName = function(caseTitle) {

  var nameMatches = caseTitle.match(/COMMONWEALTH\s+VS.\s+(\S+),\s+(\S+)(\s+(\S+))?/)
  if (nameMatches && (nameMatches.length > 1)) {
    return {
      firstName: (nameMatches[2] ? nameMatches[2].toProperCase() : null),
      middleName: (nameMatches[4] ? nameMatches[4].toProperCase() : null),
      lastName: (nameMatches[1] ? nameMatches[1].toProperCase() : null)
    }
  } else {
    return false
  }

}

var Case = sequelize.define('cases', {
  number: Sequelize.STRING,
  title: Sequelize.STRING,
  next_court_datetime: Sequelize.DATE,
  next_court_location: Sequelize.STRING
}, {
  classMethods: {
    getCaseNumberRegexp: function() {
      return CASE_NUMBER_REGEXP
    },

    isValidNumber: function(number) {
      return (number !== undefined)
        && (number.match(CASE_NUMBER_REGEXP) !== null)
    },

    normalizeCaseNumber: function(number) {

      var parts = parseCaseNumber(number)
      var normalized = ''

      if (parts.defendant) {
        normalized = sprintf('%02d-%s-%06d-%3d',
                             parts.year, parts.type, parts.serial, parts.defendant)
      } else {
        normalized = sprintf('%02d-%s-%06d',
                             parts.year, parts.type, parts.serial)
      }

      return normalized
    },

    parseDefendantName: parseDefendantName

  },

  instanceMethods: {

    compareNumberWithMax: function(cb) {

      var parts = parseCaseNumber(this.number)

      sequelize.query(
        'SELECT COUNT(*) ' +
          'FROM cases ' +
          'WHERE TO_NUMBER(SUBSTRING(number FROM \'[0-9]+$\'), \'999999\') > ' + parts.serial + ' ' +
          'AND SUBSTRING(number FROM \'^.*-\') = \'' + this.number.replace(/[0-9]+$/, '') + '\'')
        .success(function(rows) {
          console.log(rows)
          if (rows.length > 0) {
            cb(null, -1)
          } else {
            cb(null, 1)
          }
        })
        .error(cb)

    },

    defendantNameExists: function() {
      return (parseDefendantName(this.title) !== false)
    },

    parseDefendantName: function() {
      return parseDefendantName(this.title)
    }

  }

})

Case.hasMany(Contact, { joinTableName: 'case_subscriptions', foreignKey: 'case_id' })
Contact.hasMany(Case, { joinTableName: 'case_subscriptions', foreignKey: 'contact_id' })
Case.hasMany(Message)

module.exports = Case
