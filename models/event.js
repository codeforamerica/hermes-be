var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Contact = require('./contact.js'),
    Case = require('./case.js')

var Event = sequelize.define('events', {
  type: { type: Sequelize.STRING, allowNull: false },
  data: { type: Sequelize.TEXT }
}, {
  classMethods: {
    types: function() {
      return {
        MANUAL_INPUT: 'MANUAL_INPUT',
        CASE_DETAILS_RETRIVED_FROM_ORIGIN_SERVER: 'CASE_DETAILS_RETRIEVAL_FROM_ORIGIN_SERVER',
        CASE_DETAILS_UPDATED_FROM_ORIGIN_SERVER: 'CASE_DETAILS_UPDATE_FROM_ORIGIN_SERVER',
        SMS_INBOUND: 'SMS_INBOUND',
        SMS_OUTBOUND: 'SMS_OUTBOUND'

      }
    }
  }
})

Case.hasMany(Event)
Contact.hasMany(Event)
Event.belongsTo(Case)
Event.belongsTo(Contact)

module.exports = Event
