function responseBuilder(data = {}, errors = []) {
  const response = {
    errors: [],
    data: {}
  };
  if (errors) {
    response.errors = errors;
    if (errors.length > 0) {
      return response;
    }
  }
  response.data = data;
  return response;
}

function _err(code, text) {
  return JSON.stringify(responseBuilder({}, [{
    code, text
  }]));
}

function _response(data = {}) {
  return JSON.stringify(responseBuilder(data, []));
}

module.exports = {
  responseBuilder,
  _err,
  _response
};