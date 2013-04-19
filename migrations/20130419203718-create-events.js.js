var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'events', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      type: { type: 'string', notNull: true },
      data: { type: 'text' },
      case_id: { type: 'int' },
      contact_id: { type: 'int' }
    }),
    db.runSql.bind(db, 'ALTER TABLE events ADD CONSTRAINT fk_case_id FOREIGN KEY (case_id) REFERENCES cases(id)'),
    db.runSql.bind(db, 'ALTER TABLE events ADD CONSTRAINT fk_contact_id FOREIGN KEY (contact_id) REFERENCES contacts(id)')
  ], callback)
};

exports.down = function(db, callback) {
  db.dropTable('events', callback)
};
