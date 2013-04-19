var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    sprintf = require('sprintf').sprintf,
    Contact = require('./contact.js'),
    Message = require('./message.js')

var CASE_NUMBER_REGEXP = /(\d[1-9]?)-?(AD|C|CI|CR|D|F|H|J|M|P|S|T|XX)-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?/

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
      return (number != undefined)
        && (number.match(CASE_NUMBER_REGEXP) != null)
    },

    normalizeCaseNumber: function(number) {

      var matches = number.match(CASE_NUMBER_REGEXP)

      var normalized = ''
      var year = parseInt(matches[1])
      var type = matches[2].toUpperCase()
      var serial = parseInt(matches[3])
      
      if (matches[4]) {
        var defendant = parseInt(matches[4])
        normalized = sprintf('%02d-%s-%06d-%3d', year, type, serial, defendant)
      } else {
        normalized = sprintf('%02d-%s-%06d', year, type, serial)
      }

      return normalized
    }

  }
  
})

Case.hasMany(Contact, { joinTableName: 'case_subscriptions', foreignKey: 'case_id' })
Contact.hasMany(Case, { joinTableName: 'case_subscriptions', foreignKey: 'contact_id' })
Case.hasMany(Message)

module.exports = Case
