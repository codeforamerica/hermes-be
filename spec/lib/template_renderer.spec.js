var templateRenderer = require('../../lib/template_renderer.js')

describe("Template Renderer", function() {

  var renderer

  beforeEach(function() {
    renderer = templateRenderer({
      templatesDir: __dirname + '/../fixtures/templates/'
    })
  }) // END - beforeEach
    
  it ("should fail if non existent template name is used", function(done) {
    
    renderer.render("non-existent-template", {}, function(err, text) {
      expect(err).not.toBe(null)
      done()
    })
    
  }) // END - it should fail if non existent template name is used
  
  it ("should succeed if existing template name is used", function(done) {

    renderer.render("simple-template", { caseNumber: '13-T-000111' }, function(err, text) {
      expect(err).toBe(null)
      expect(text).toBe("This should be a case number: 13-T-000111.")
      done()
    })

  }) // END - it should fail if non existent template name is used

})
