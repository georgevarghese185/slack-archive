const { faker } = require('@faker-js/faker');

class TextGenerator {
  generateAlphaNum(length) {
    return faker.random.alphaNumeric(length, { casing: 'upper' });
  }

  generateSentence() {
    return faker.lorem.sentences();
  }
}

module.exports = {
  TextGenerator,
};
