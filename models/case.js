var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Contact = require('./contact.js'),
    Message = require('./message.js')

var Case = sequelize.define('cases', {
  number: Sequelize.STRING,
  title: Sequelize.STRING,
  next_court_datetime: Sequelize.DATE,
  next_court_location: Sequelize.STRING
})

Case.hasMany(Contact, { joinTableName: 'case_contacts', foreignKey: 'case_id' })
Contact.hasMany(Case, { joinTableName: 'case_contacts', foreignKey: 'contact_id' })
Case.hasMany(Message)

module.exports = Case
