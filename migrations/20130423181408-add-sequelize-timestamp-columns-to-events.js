var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.addColumn.bind(db, 'events', 'created_at', { type: 'datetime' }),
    db.addColumn.bind(db, 'events', 'updated_at', { type: 'datetime' })
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.removeColumn.bind(db, 'events', 'created_at'),
    db.removeColumn.bind(db, 'events', 'updated_at')
  ], callback)
};
