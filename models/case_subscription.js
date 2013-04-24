var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Contact = require('./contact.js'),
    Case = require('./case.js')

var CaseSubscription = sequelize.define('case_subscriptions', {
  state: { type: Sequelize.ENUM('SUBSCRIBED', 'UNCONFIRMED', 'UNCONFIRMED_DELAYED'), allowNull: false },
  subscription_datetime: Sequelize.DATE
})

Case.hasMany(CaseSubscription)
Contact.hasMany(CaseSubscription)
CaseSubscription.belongsTo(Case)
CaseSubscription.belongsTo(Contact)

module.exports = CaseSubscription
