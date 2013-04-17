var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('case_contacts', 'subscription_state', { type: 'string', defaultValue: 'SUBSCRIBED' }, callback)
};
  
exports.down = function(db, callback) {
  db.removeColumn('case_contacts', 'subscription_state', callback)
};
