import { faker } from '@faker-js/faker';

export class RandomGenerator {
  memberId() {
    return 'U' + this.alphanum(8);
  }

  teamId() {
    return 'T' + this.number(8);
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

  alphanum(n: number) {
    return faker.random.alphaNumeric(n, { casing: 'upper' });
  }

  number(digits: number) {
    return faker.datatype.number({
      min: Math.pow(10, digits),
      max: Math.pow(10, digits + 1) - 1,
    });
  }
}
