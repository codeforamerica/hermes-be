if (process.env.DATABASE_URL) {

  var dbUrlRegex = /([^:]+):\/\/([^:]+):([^@]+)@([^:]+):([\d]+)\/(.+)/
  var matches = process.env.DATABASE_URL.match(dbUrlRegex)

  module.exports = {
    db: {
      name: matches[6],
      username: matches[2],
      password: matches[3],
      host: matches[4],
      port: matches[5]
    }
  }

}
