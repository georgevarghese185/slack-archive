const CryptoJS = require('crypto-js');

const aesEncrypt = (message, password) => {
  return CryptoJS.AES.encrypt(message, password).toString();
}

const aesDecrypt = (cipher, password) => {
  return CryptoJS.AES.decrypt(cipher, password).toString(CryptoJS.enc.Utf8);
}

module.exports = {
  aesEncrypt,
  aesDecrypt
}
