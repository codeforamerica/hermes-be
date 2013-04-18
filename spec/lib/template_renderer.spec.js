var templateRenderer = require('../../lib/template_renderer.js')

describe("Template Renderer", function() {

  var renderer

  beforeEach(function() {
    renderer = templateRenderer({
      templatesDir: __dirname + '/../fixtures/templates/'
    })
  }) // END - beforeEach
    
  describe ("for render", function() {

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
    
  }) // END describe - for render

  describe ("for exists", function() {

    it ("should return true if template exists", function(done) {

      renderer.exists("simple-template", function(exists) {
        expect(exists).toBe(true)
        done()
      })

    })

    it ("should return false if template does NOT exist", function(done) {

      renderer.exists("non-existent-template", function(exists) {
        expect(exists).toBe(false)
        done()
      })
      
    })
    
  }) // END describe - for exists

  describe("for raw", function() {

    it ("should return the raw template", function(done) {

      renderer.raw("simple-template", function(err, rawText) {
        expect(err).toBe(null)
        expect(rawText).toBe("This should be a case number: {{caseNumber}}.")
        done()
      })

    })

  }) // END describe - for raw

})
