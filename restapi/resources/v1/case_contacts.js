var common = require('./common.js'),
    models = require('../../../models')

exports.post = function(req, res) {

  var body = JSON.parse(req.body)

  // Validation
  if (!body.hasOwnProperty('case_number')) {
    res.send(400, common.getErrorJson("Please specify case number."))
  }

  if (!body.hasOwnProperty('cellphone_number')) {
    res.send(400, common.getErrorJson("Please specify cellphone number."))
  }

  // Create case if it doesn't already exist
  models.case.findOrCreate({ number: body.case_number }, {})
    .success(function(c) {
      console.log(c)
    })
            
}
