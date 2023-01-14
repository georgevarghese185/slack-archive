const memberTemplate = require('./member.json');
const { TextGenerator } = require('../text');
const { faker } = require('@faker-js/faker');

class MemberGenerator {
  constructor(options = {}) {
    this.teamId =
      options.teamId ||
      `T${faker.datatype.number({ min: '1000', max: '9999' })}`;
    this.maxMembers = options.maxMembers || 5;
    this.generated = 0;
  }

  generateMember() {
    const textGenerator = new TextGenerator();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const realName = firstName + ' ' + lastName;
    const image = faker.internet.avatar();

    const member = JSON.parse(JSON.stringify(memberTemplate)); // deep copy TODO use a library

    member.id = 'U' + textGenerator.generateAlphaNum(8);

    member.team_id = member.profile.team = this.teamId;

    member.name = firstName.toLowerCase();

    member.real_name = member.profile.real_name = member.profile.real_name = member.profile.real_name_normalized = member.profile.display_name = member.profile.display_name_normalized = realName;

    member.profile.first_name = firstName;
    member.profile.last_name = lastName;

    member.profile.image_original = member.profile.image_24 = member.profile.image_32 = member.profile.image_48 = member.profile.image_72 = member.profile.image_192 = member.profile.image_512 = member.profile.image_1024 = image;

    this.generated++;

    return member;
  }

  generateMembers() {
    const members = [];

    for (let i = 0; i < this.maxMembers; i++) {
      const member = this.generateMember();
      members.push(member);
    }

    return members;
  }
}

module.exports = {
  MemberGenerator,
};
