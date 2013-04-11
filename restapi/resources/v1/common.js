exports.getErrorJson = function(message, code) {

  response = {
    message: message.toString()
  }

  if (code) {
    response.code = code
  }

  return response
}

