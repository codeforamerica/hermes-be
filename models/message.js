var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize')

var Message = sequelize.define('messages', {
  sender: Sequelize.STRING,
  recipient: Sequelize.STRING,
  external_id: Sequelize.STRING,
  body: Sequelize.TEXT
})

module.exports = Message
