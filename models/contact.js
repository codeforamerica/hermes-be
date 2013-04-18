var sequelize = require('../lib/sequelize.js'),
    Sequelize = require('sequelize'),
    Message = require('./message.js')

var CELL_NUMBER_REGEXP = /^(\+\d)?[\d\.\-\s]+$/

var Contact = sequelize.define('contacts', {
  cell_number: Sequelize.STRING
}, {
  classMethods: {
    normalizeCellNumber: function(cellNumber) {
      cellNumber = cellNumber.replace(/[^\d]/, '')

      // ASSUMPTION! All 10-digit numbers are US numbers!
      if (cellNumber.length == 10) {
        cellNumber = '+1' + cellNumber
      }
      else if ((cellNumber.length == 11) && (cellNumber[0] == '1')) {
        cellNumber = '+' + cellNumber
      }

      return cellNumber

    },

    isValidNumber: function(cellNumber) {
      return (cellNumber.match(CELL_NUMBER_REGEXP) != null)
    }
  }
})

Contact.hasMany(Message)

module.exports = Contact
