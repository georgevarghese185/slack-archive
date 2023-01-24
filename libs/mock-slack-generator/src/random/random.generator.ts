import { faker } from '@faker-js/faker';

export class RandomGenerator {
  memberId() {
    return 'U' + this.alphanum(8);
  }

  teamId() {
    return 'T' + this.number(8);
  }

  channelId() {
    return 'C' + this.alphanum(8);
  }

  channelName() {
    return faker.lorem.word();
  }

  conversationTopic() {
    return faker.lorem.sentence(3);
  }

  conversationPurpose() {
    return faker.lorem.sentence(5);
  }

  message() {
    return faker.lorem.sentences(this.number(1, 20));
  }

  name() {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
  }

  username() {
    return faker.internet.userName();
  }

  avatar() {
    return faker.internet.avatar();
  }

  item<T>(items: T[]): T {
    const item =
      items[faker.datatype.number({ min: 0, max: items.length - 1 })];
    if (!item) {
      throw new Error(
        'Could not pick a random item. Did you provide an empty list?',
      );
    }
    return item;
  }

  alphanum(n: number) {
    return faker.random.alphaNumeric(n, { casing: 'upper' });
  }

  number(digits: number): number;
  number(min: number, max: number): number;
  number(digitsOrMin: number, max?: number) {
    let maxValue: number;
    let minValue: number;

    if (max == null) {
      const digits = digitsOrMin;
      minValue = Math.pow(10, digits);
      maxValue = Math.pow(10, digits + 1) - 1;
    } else {
      minValue = digitsOrMin;
      maxValue = max;
    }

    return faker.datatype.number({
      min: minValue,
      max: maxValue,
    });
  }

  probability(probability: number) {
    return Math.random() <= probability;
  }
}
