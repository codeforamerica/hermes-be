var config = require('config'),
    common = require('./common.js'),
    templateRenderer = require('../../../lib/template_renderer.js')

exports.selfLink = function(id) {
  return config.restapi.baseuri + '/v1/template/' + id
}

exports.get = function(req, res) {

  var id = req.params.id
  if (!id) {
    res.send(400, common.getErrorJson('Please pass in template name'))
  }

  var renderer = templateRenderer()
  renderer.exists(id, function(exists) {

    if (!exists) {
      res.send(404, common.getErrorJson('Template "' + id + '" does not exist'))
    }

    else {

      renderer.raw(id, function(err, rawText) {
        
        if (err) {
          console.error(err)
          res.send(500, common.getErrorJson('Could not retrieve template.'))
        }

        else {
          res.send(200, rawText)
        }

      }) // END - renderer.raw

    } // END else - template exists
    
  }) // END - renderer.exists

}

exports.post = function(req, res) {

  var id = req.params.id
  if (!id) {
    res.send(400, common.getErrorJson('Please pass in template name'))
  }

  var replacements = JSON.parse(req.body)

  var renderer = templateRenderer()
  renderer.render(id, replacements, function(err, renderedText) {

    if (err) {
      console.error(err)
      res.send(500, common.getErrorJson('Could not render template.'))
    }

    else {
      res.send(200, renderedText)
    }

  })

}
