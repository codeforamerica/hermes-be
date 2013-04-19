var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.renameTable.bind(db, 'case_contacts', 'case_subscriptions'),
    db.renameColumn.bind(db, 'case_subscriptions', 'subscription_state', 'state')
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.renameColumn.bind(db, 'case_subscriptions', 'state', 'subscription_state'),
    db.renameTable.bind(db, 'case_subscriptions', 'cases_contacts')
  ], callback)
};
