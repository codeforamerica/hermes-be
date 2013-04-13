var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Contact = require('./contact.js'),
    Case = require('./case.js')

var CaseContact = sequelize.define('case_contacts', {
  subscription_state: { type: Sequelize.ENUM('SUBSCRIBED', 'UNSUBSCRIBED'), allowNull: false, defaultValue: 'SUBSCRIBED' }
})

Case.hasMany(CaseContact)
Contact.hasMany(CaseContact)
CaseContact.belongsTo(Case)
CaseContact.belongsTo(Contact)

module.exports = CaseContact
