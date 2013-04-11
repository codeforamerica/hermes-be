var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('contacts', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    cell_number: { type: 'string', unique: true }
  }, callback)
};

exports.down = function(db, callback) {
  db.dropTable('contacts', callback)
};
