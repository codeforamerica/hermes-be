exports.getErrorJson = function(message, code) {

  var response = {
    message: message.toString()
  }

  if (code) {
    response.code = code
  }

  return response
}

