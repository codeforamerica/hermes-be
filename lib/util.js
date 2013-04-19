
exports.handleError = function(cb, f) {
  return function() {
    var err = arguments[0]
    if (err) {
      cb(err)
    } else {
      args = []
      for (var i = 1; i < arguments.length; ++i) {
        args.push(arguments[i])
      }
      f.apply(null, args)
    }
  }
}
