var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Contact = require('./contact.js'),
    Case = require('./case.js')

var Event = sequelize.define('events', {
  type: { type: Sequelize.STRING, allowNull: false },
  data: { type: Sequelize.TEXT }
})

Case.hasMany(Event)
Contact.hasMany(Event)
Event.belongsTo(Case)
Event.belongsTo(Contact)

module.exports = Event
