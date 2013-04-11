var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.addColumn.bind(db, 'cases', 'title', { type: 'string' }),
    db.addColumn.bind(db, 'cases', 'next_court_datetime', { type: 'datetime' }),
    db.addColumn.bind(db, 'cases', 'next_court_location', { type: 'string' })
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.dropColumn.bind(db, 'cases', 'next_court_location'),
    db.dropColumn.bind(db, 'cases', 'next_court_datetime'),
    db.dropColumn.bind(db, 'cases', 'title')
  ], callback)
};
