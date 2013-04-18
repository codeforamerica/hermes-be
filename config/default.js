var matches = []
if (process.env.DATABASE_URL) {
  
  var dbUrlRegex = /([^:]+):\/\/([^:]+):([^@]+)@([^:]+):([\d]+)\/(.+)/
  matches = process.env.DATABASE_URL.match(dbUrlRegex)

}

module.exports = {
  db: {
    name: matches[6] || 'hermes',
    username: matches[2] || 'hermes',
    password: matches[3] || 'hermes',
    host: matches[4] || 'localhost',
    port: matches[5] || 5432
  },
  restapi: {
    port: process.env.PORT || 8080,
    baseuri: 'http://localhost:8080'
  },
  responses: {
    clerkPhone: "(999) 999-9999"
  },
  misc: {
    cellPhoneAreaCode: "502"
  }
}
