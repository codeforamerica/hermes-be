var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'messages', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      sender: { type: 'string', notNull: true },
      recipient: { type: 'string', notNull: true },
      body: { type: 'string', notNull: true },
      external_id: { type: 'string' },
      case_id: { type: 'int' },
      contact_id: { type: 'int', notNull: true },
      created_at: { type: 'datetime' },
      updated_at: { type: 'datetime' }
    }),
    db.runSql.bind(db, 'ALTER TABLE messages ADD CONSTRAINT fk_case_id FOREIGN KEY (case_id) REFERENCES cases(id)'),
    db.runSql.bind(db, 'ALTER TABLE messages ADD CONSTRAINT fk_contact_id FOREIGN KEY (contact_id) REFERENCES contacts(id)')
  ], callback)
};

exports.down = function(db, callback) {
  db.dropTable('messages', callback)
};
