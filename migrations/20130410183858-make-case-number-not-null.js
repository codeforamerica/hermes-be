var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.changeColumn('cases', 'number', { type: 'string', unique: true, notNull: true }, callback)
};

exports.down = function(db, callback) {
  db.changeColumn('cases', 'number', { type: 'string', unique: true }, callback)
};
