module.exports = function() {

  var details = {
    title: null,
    nextCourtDateTime: null,
    nextCourtLocation: null,
    defendantFirstName: null,
    defendantMiddleName: null,
    defendantLastName: null
  }

  var error

  return {

    setTitle: function(title) {
      details.title = title
      return this
    },

    setNextCourtDateTime: function(nextCourtDateTime) {
      details.nextCourtDateTime = nextCourtDateTime
      return this
    },

    setNextCourtLocation: function(nextCourtLocation) {
      details.nextCourtLocation = nextCourtLocation
      return this
    },

    setDefendantFirstName: function(defendantFirstName) {
      details.defendantFirstName = defendantFirstName
      return this
    },

    setDefendantMiddleName: function(defendantMiddleName) {
      details.defendantMiddleName = defendantMiddleName
      return this
    },

    setDefendantLastName: function(defendantLastName) {
      details.defendantLastName = defendantLastName
      return this
    },

    setError: function(err) {
      error = err
      return this
    },

    build: function() {
      return function(caseNumber) {

        return {
          fetch: function(cb) {
            if (error) {
              cb(error)
            } else {
              cb(null, details)
            }
          }
        }

      }

    }

  }

}
