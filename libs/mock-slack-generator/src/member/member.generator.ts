import type { Member } from './member';
import { RandomGenerator } from '../random';
import memberTemplate from './member.template.json';

export type MemberGeneratorOptions = {
  teamId?: string;
  randomGenerator?: RandomGenerator;
};

export class MemberGenerator {
  private teamId: string;
  private random: RandomGenerator;

  constructor(options: MemberGeneratorOptions = {}) {
    this.random = options.randomGenerator || new RandomGenerator();
    this.teamId = options.teamId || this.random.teamId();
  }

  generateMember(): Member {
    const id = this.random.memberId();
    const username = this.random.username();
    const { firstName, lastName } = this.random.name();
    const realName = firstName + ' ' + lastName;
    const image = this.random.avatar();

    const member = JSON.parse(JSON.stringify(memberTemplate)); // deep copy TODO use a library

    member.id = id;
    member.team_id = member.profile.team = this.teamId;
    member.name = username;
    member.real_name =
      member.profile.real_name =
      member.profile.real_name =
      member.profile.real_name_normalized =
        realName;
    member.profile.display_name = member.profile.display_name_normalized =
      firstName.toLowerCase();
    member.profile.first_name = firstName;
    member.profile.last_name = lastName;
    member.profile.image_original =
      member.profile.image_24 =
      member.profile.image_32 =
      member.profile.image_48 =
      member.profile.image_72 =
      member.profile.image_192 =
      member.profile.image_512 =
      member.profile.image_1024 =
        image;

    return member;
  }

  generateMembers(n: number): Member[] {
    return new Array(n).fill(null).map(() => this.generateMember());
  }
}
