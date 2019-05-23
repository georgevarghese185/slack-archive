const CryptoJS = require('crypto-js');

const aesEncrypt = (message, password) => {
  return CryptoJS.AES.encrypt(message, password).toString();
}

const aesDecrypt = (cipher, password) => {
  return CryptoJS.AES.decrypt(cipher, password).toString(CryptoJS.enc.Utf8);
}

const sha256Hash = message => {
  return CryptoJS.SHA256(message).toString();
}

module.exports = {
  aesEncrypt,
  aesDecrypt,
  sha256Hash
}
