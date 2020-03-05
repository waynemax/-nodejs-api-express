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

function rand(length, ...ranges) {
  let str = "";
  while(length--) {
    const ind = Math.floor(Math.random() * ranges.length);
    const min = ranges[ind][0].charCodeAt(0),
      max = ranges[ind][1].charCodeAt(0);
    const c = Math.floor(Math.random() * (max - min + 1)) + min;
    str += String.fromCharCode(c);
  }
  return str;
}

// console.log(rand(4, ["A", "Z"], ["0", "9"]));
// console.log(rand(20, ["a", "f"], ["A", "Z"], ["0", "9"]));
// console.log("Random binary number: ", rand(8, ["0", "1"]));
// console.log("Random HEX color: ", "#" + rand(6, ["A", "F"], ["0", "9"]));

module.exports = {
  responseBuilder,
  _err,
  _response,
  rand
};