/* jshint -W024 */ // For the use of 'case'
var contactStates = require('./contact_states'),
    util = require('./util.js'),
    models = require('../models')

module.exports = function(contact) {

  var findSubscriptionsForContact = function(cb) {

    models.case_subscription.findAll({
      where: {
        state: [ 'SUBSCRIBED', 'UNCONFIRMED' ],
        contact_id: contact.id
      },
      include: [ models.case ]
    })
      .success(function(subscriptions) { cb(null, subscriptions) })
      .error(cb)

  } // END function - findSubscriptionsForContact

  return {

    getCurrentState: function(cb) {

      findSubscriptionsForContact(util.handleError(cb, function(subscriptions) {

        var state
        if (subscriptions.length === 0) {
          // Contact has no subscriptions
          // --> initial state
          state = contactStates.initial(contact)
        }

        var subscription = subscriptions[0]

        if (subscription.state == 'UNCONFIRMED') {
          // Contact has one subscription pending confirmation
          // --> unconfirmed subscription state
          state = contactStates.unconfirmed_subscription(contact, subscription)
        }

        if (subscription.state == 'CONFIRMED') {
          // Contact has one confirmed subscription
          // --> confirmed subscription state
          state = contactStates.confirmed_subsription(contact, subscription)
        }

        if (subscription.state == 'UNCONFIRMED_DELAYED') {
          // Contact has one subscription pending confirmation because case details are not yet available
          // --> unconfirmed delayed subscription state
          state = contactStates.unconfirmed_delayed_subsription(contact, subscription)
        }

        cb(null, state)

      }))

    }

  } // END - public object

}
