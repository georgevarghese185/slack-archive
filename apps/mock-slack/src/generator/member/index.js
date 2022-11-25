const memberTemplate = require('./member.json');
const names = require('./names.json').names;
const avatars = require('./avatars.json').avatars;
const { TextGenerator } = require('../text');
const { randomItems } = require('../random');

class MemberGenerator {
  constructor(options, textGenerator) {
    this.teamId = options.teamId;
    this.maxMembers = options.maxMembers;
    this.generated = 0;
  }

  generateMember(name, image) {
    const textGenerator = new TextGenerator();
    const firstName = name.first;
    const lastName = name.last;
    const realName = firstName + ' ' + lastName;

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
    const memberNames = randomItems(names, this.maxMembers);
    const memberAvatars = randomItems(avatars, this.maxMembers);

    for (let i = 0; i < this.maxMembers; i++) {
      const member = this.generateMember(memberNames[i], memberAvatars[i]);
      members.push(member);
    }

    return members;
  }
}

module.exports = {
  MemberGenerator,
};
