var templateRenderer = require('../../lib/template_renderer.js')

describe("Template Renderer", function() {

  it ("should fail if non existent template name is used", function(done) {

    var renderer = templateRenderer('../fixtures/templates')

    renderer.render("non-existent-template", {}, function(err, text) {
      expect(err).not.toBe(null)
      done()
    })

  })

})
