import type { Member, MemberGenerator } from '../member';
import { RandomGenerator } from '../random';
import type { File } from './file';
import memberTemplate from './file.template.json';

export type FileGeneratorOptions = {
  randomGenerator?: RandomGenerator;
  members?: Member[];
  memberGenerator?: MemberGenerator;
  teamId?: string;
};

export class FileGenerator {
  private teamId: string;
  private random: RandomGenerator;

  constructor(options: FileGeneratorOptions = {}) {
    this.random = options.randomGenerator || new RandomGenerator();
    this.teamId = options.teamId || this.random.teamId();
  }

  generateFile(): File {
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
