var mustache = require('mustache'),
    fs = require('fs')

module.exports = function(options) {

  var options = options || {}
  var templatesDir = options.templatesDir || __dirname + '/../templates/'

  var getTemplateFilePath = function(name) {
    return templatesDir + name + ".mustache.txt"
  }

  return {

    render: function(name, replacements, cb) {

      fs.readFile(getTemplateFilePath(), function(err, template) {

        if (err) {
          cb(err)
        }
        
        else {

          cb(null, mustache.render(template, replacements))

        }

      })

    } // END function - render

  } // END - public object

}
