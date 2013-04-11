var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'case_contacts', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      case_id: { type: 'int', notNull: true },
      contact_id: { type: 'int', notNull: true }
    }),
    db.runSql.bind(db, 'ALTER TABLE case_contacts ADD CONSTRAINT fk_case_id FOREIGN KEY (case_id) REFERENCES cases(id)'),
    db.runSql.bind(db, 'ALTER TABLE case_contacts ADD CONSTRAINT fk_contact_id FOREIGN KEY (contact_id) REFERENCES contacts(id)')
  ], callback)
};

exports.down = function(db, callback) {
  db.dropTable('case_contacts', callback)
};
