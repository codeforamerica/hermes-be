var config = require('config'),
    Sequelize = require('sequelize')
  
module.exports = new Sequelize(config.db.name, config.db.username, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres'
})
