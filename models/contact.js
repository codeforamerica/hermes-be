var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Message = require('./message.js')

var Contact = sequelize.define('contacts', {
  cell_number: Sequelize.STRING
})

Contact.hasMany(Message)

module.exports = Contact
