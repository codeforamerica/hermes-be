var mustache = require('mustache'),
    fs = require('fs')

module.exports = function(options) {

  var options = options || {}
  var templatesDir = options.templatesDir || __dirname + '/../templates/'

  var getTemplateFilePath = function(name) {
    return templatesDir + name.replace(/[^a-zA-Z0-9]/g, '-') + ".mustache"
  }

  var raw = function(name, cb) {
    fs.readFile(getTemplateFilePath(name), { encoding: 'utf8' }, function(err, data) {
      if (err) {
        cb(err)
      } else {
        cb(null, data.trim())
      }
    })
  } // END function - raw
  
  return {

    render: function(name, replacements, cb) {
      raw(name, function(err, template) {
        cb(err, mustache.render(template, replacements).trim())
      })
    }, // END function - render

    exists: function(name, cb) {
      fs.exists(getTemplateFilePath(name), cb)
    }, // END function - exists
    
    raw: raw

  } // END - public object

}
