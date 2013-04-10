var config = require('config'),
    restify = require('restify'),
    resources = require(__dirname + '/resources')

// Define server
var server = restify.createServer({
  name: 'hermes-restapi',
  version: '0.0.1'
})

server.use(restify.bodyParser())

// Routes
server.post('/v1/case-contacts', resources.v1.case_contacts.post)

// Start server
server.listen(config.restapi.port, function() {
  console.log("%s listening at %s", server.name, server.url)
})
