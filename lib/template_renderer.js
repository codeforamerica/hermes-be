var mustache = require('mustache'),
    fs = require('fs')

module.exports = function(options) {

  var options = options || {}
  var templatesDir = options.templatesDir || __dirname + '/../templates/'

  var getTemplateFilePath = function(name) {
    return templatesDir + name + ".mustache"
  }

  return {

    render: function(name, replacements, cb) {

      fs.readFile(getTemplateFilePath(name), { encoding: 'utf8' }, function(err, template) {
        cb(err, mustache.render(template, replacements).trim())
      })

    } // END function - render

  } // END - public object

}
