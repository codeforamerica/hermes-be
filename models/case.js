var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Contact = require('./contact.js'),
    Message = require('./message.js')

var CASE_NUMBER_REGEXP = /(\d[1-9]?)-?([A-Za-z]+)-?(\d{0,5}[1-9])-?(\d{0,2}[1-9])?/

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
      return (number.match(CASE_NUMBER_REGEXP) != null)
    }
  }
})

Case.hasMany(Contact, { joinTableName: 'case_contacts', foreignKey: 'case_id' })
Contact.hasMany(Case, { joinTableName: 'case_contacts', foreignKey: 'contact_id' })
Case.hasMany(Message)

module.exports = Case
