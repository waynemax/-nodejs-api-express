/* https://github.com/waynemax/Wcrypt */

const {x, y} = require('./w_data');
const nstring = '',
  __x__ = x,
  __y__ = y;

function _chr(codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  } else {
    return String.fromCharCode(codePt);
  }
}

function _ord(str, idx) {
  const code = str.charCodeAt(idx);
  if (0xD800 <= code && code <= 0xDBFF) {
    const hi = code;
    const low = str.charCodeAt(idx+1);
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) {
    const hi = str.charCodeAt(idx-1);
    return ((hi - 0xD800) * 0x400) + (code - 0xDC00) + 0x10000;
  }
  return code;
}

function decbin(number) {
  if (number < 0) {
    number = 0xFFFFFFFF + number + 1;
  }
  return parseInt(number, 10).toString(2);
}

function bindec(binary_string) {
  binary_string = (binary_string + nstring).replace(/[^01]/gi, nstring);
  return parseInt(binary_string, 2);
}

function _round(number, count) {
  return Math.ceil((number)*count)/count;
}

function _mt_rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function str_replace(search, replace, subject, count) {
  let i = 0,
    j = 0,
    temp = nstring,
    repl = nstring,
    sl = 0,
    fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = Object.prototype.toString.call(r) === '[object Array]',
    sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }
  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === nstring) {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + nstring;
      repl = ra ? (r[j] !== undefined ? r[j] : nstring) : r[0];
      s[i] = (temp).split(f[j]).join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
}

function wcrypt_encode(str) {
  let i = md = z = v = j = undefined,
    array = [],
    aStr = [],
    key = nstring,
    a = nstring,
    res = nstring,
    pattern = '423',
    counter = Number(pattern.length) - 1;
  const stroke_num = _mt_rand(20, 39);
  const rn = String(stroke_num);
  for (i = 0; i < 16; i++) {
    z = _mt_rand(0, counter);
    key += pattern.substr(z, 1);
    array.push(pattern.substr(z, 1))
  }
  md = {'key': key,'array': array};
  for (i = 0; i < str.length; i++) {
    res += str_replace(
      ['0000','000','00','.','0101','1111','111'],
      ['9','8','7','6','-','V',':'],((decbin(_ord(str.substr(i, 1)))) + nstring)
    ) + '5';
  }
  aStr = res.split(nstring);
  v = 0;
  for (j = 0; j < aStr.length; j++) {
    if (v === 15) v = 0;
    if (aStr[j] === '1')	aStr[j] = md.array[v];
    v++;
  }
  aStr = aStr.join(nstring);
  aStr = str_replace(__x__[stroke_num], __y__[stroke_num], aStr);
  return rn[0] + md.key.slice(0, 8) + aStr + md.key.slice(8, 16) + rn[1]
}

function wcrypt_decode(str) {
  const rn1 = str.substr(0, 1);
  const rn2 = str.substr(str.length - 1, 1);
  const stroke_num = parseInt(rn1 + rn2);
  str = str.slice(1, str.length-1);
  let array = [],
    j = v = i = undefined;
  for (j=0; j < str.length; j++) {
    array.push(str[j]);
  }
  str = array.slice(8,str.length).join(nstring);
  str = str_replace(__y__[stroke_num],__x__[stroke_num],str);
  const md = array.slice(0, 8).join(nstring) + array.slice(
    array.length - 8,array.length
  ).join(nstring);
  v = 0;
  let aStr = [];
    aStr = str.split(nstring);
  for (j=0; j < str.length; j++) {
    if (v === 15) v = 0;
    if (md[v] === aStr[j]) aStr[j] = '1';
    v++;
  }
  str = (aStr.join(nstring).split('5'));
  delete str[str.length-1];
  const result = [];
  for (i = 0; i < str.length-1; i++) {
    result.push(_chr(Number((bindec((str_replace(
      ['9','8','7','6','-','V',':'],
      ['0000','000','00','.','0101','1111','111'],str[i])) + nstring))))
    );
  }
  return result.join(nstring);
}

module.exports = {
  wcrypt_decode,
  wcrypt_encode,
  str_replace,
  _ord,
  _chr,
  decbin,
  bindec,
  _round,
  _mt_rand
};
