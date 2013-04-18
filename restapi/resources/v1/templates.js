var async = require('async'),
    common = require('./common.js'),
    templateResource = require('./template.js'),
    templateRenderer = require('../../../lib/template_renderer.js')

exports.get = function(req, res) {

  var renderer = templateRenderer()
  renderer.list(function(err, list) {

    if (err) {
      console.error(err)
      res.send(500, common.getErrorJson('Could not retrieve list of templates.'))
    }

    else {

      var body = {
        templates: {}
      }

      async.each(
        list,
        function(templateName, cb) {
          body.templates[templateName] = { _links: { self: templateResource.selfLink(templateName) } }
          cb()
        },
        function(err) {
          res.send(200, body)
        }
      )
    }

  })

}
