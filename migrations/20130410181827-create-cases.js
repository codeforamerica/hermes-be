var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('cases', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    number: { type: 'string', unique: true }
  }, callback)
};

exports.down = function(db, callback) {
  db.dropTable('cases', callback)
};

