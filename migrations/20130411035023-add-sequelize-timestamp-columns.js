var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.addColumn.bind(db, 'cases', 'created_at', { type: 'datetime' }),
    db.addColumn.bind(db, 'cases', 'updated_at', { type: 'datetime' }),
    db.addColumn.bind(db, 'contacts', 'created_at', { type: 'datetime' }),
    db.addColumn.bind(db, 'contacts', 'updated_at', { type: 'datetime' }),
    db.addColumn.bind(db, 'case_contacts', 'created_at', { type: 'datetime' }),
    db.addColumn.bind(db, 'case_contacts', 'updated_at', { type: 'datetime' })
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.removeColumn.bind(db, 'cases', 'created_at'),
    db.removeColumn.bind(db, 'cases', 'updated_at'),
    db.removeColumn.bind(db, 'contacts', 'created_at'),
    db.removeColumn.bind(db, 'contacts', 'updated_at'),
    db.removeColumn.bind(db, 'case_contacts', 'created_at'),
    db.removeColumn.bind(db, 'case_contacts', 'updated_at')
  ], callback)
};
