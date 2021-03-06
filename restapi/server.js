var config = require('config'),
    restify = require('restify'),
    resources = require(__dirname + '/resources')

// Define server
var server = restify.createServer({
  name: 'hermes-restapi',
  version: '0.0.1'
})

server.use(restify.bodyParser())
server.use(restify.CORS())
server.use(restify.fullResponse())

// Routes
server.post('/v1/case/:number/subscribers', resources.v1.case_subscribers.post)
server.post('/v1/messages', resources.v1.messages.post)
server.get('/v1/template/:id', resources.v1.template.get)
server.post('/v1/template/:id', resources.v1.template.post)
server.get('/v1/templates', resources.v1.templates.get)

// Start server
server.listen(config.restapi.port, function() {
  console.log('%s listening at %s', server.name, server.url)
})
