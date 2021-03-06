/**
 * Created by jiachenpan on 16/11/18.
 */

/* 至多保留两位小数*/
export function isPointNumber(str) {
  return RegExp(/^\d{1,}(.\d{1,2})?$/, 'g').test(str)
}

export function isvalidUsername(str) {
  // const valid_map = ['10011', '10012']
  return validate3Number(str)
}

/* 三位以上数字*/
export function validate3Number(str) {
  const urlregex = /^([0-9]){3,}$/
  return urlregex.test(str)
}

/* 五位以上数字*/
export function validateNumber(str) {
  const urlregex = /^([0-9]){5,}$/
  return urlregex.test(str)
}

/* 合法uri*/
export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/* 小写字母*/
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母*/
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母*/
export function validatAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

