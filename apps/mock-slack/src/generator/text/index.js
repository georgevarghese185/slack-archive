const lipsums = require('./lipsums.json').lipsums;

class TextGenerator {
  generateAlphaNum(length) {
    var options = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChar = () =>
      options[Math.floor(Math.random() * options.length)];
    let s = '';

    for (let i = 0; i < length; i++) {
      s += randomChar();
    }

    return s;
  }

  generateSentence() {
    return lipsums[Math.floor(Math.random() * lipsums.length)];
  }
}

module.exports = {
  TextGenerator,
};
