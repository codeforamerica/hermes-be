var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('case_subscriptions', 'subscription_datetime', { type: 'datetime' }, callback)
};

exports.down = function(db, callback) {
  db.removeColumn('case_subscriptions', 'subscription_datetime', callback)
};
