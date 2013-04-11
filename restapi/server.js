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
server.post('/v1/messages', resources.v1.messages.post)

// Start server
server.listen(config.restapi.port, function() {
  console.log("%s listening at %s", server.name, server.url)
})
