var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.changeColumn('case_contacts', 'subscription_state', { type: 'string', defaultValue: 'UNCONFIRMED' }, callback)
};

exports.down = function(db, callback) {
  db.changeColumn('case_contacts', 'subscription_state', { type: 'string', defaultValue: 'SUBSCRIBED' }, callback)
};
