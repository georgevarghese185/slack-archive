import { Member } from '../member.types';

export class MemberDto {
  id!: string;
  profile!: {
    display_name: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    image_1024: string;
  };

  static fromMember(member: Member) {
    const memberDto = new MemberDto();
    memberDto.id = member.id;
    memberDto.profile = {
      display_name: member.json.profile.display_name,
      image_24: member.json.profile.image_24,
      image_32: member.json.profile.image_32,
      image_48: member.json.profile.image_48,
      image_72: member.json.profile.image_72,
      image_192: member.json.profile.image_192,
      image_512: member.json.profile.image_512,
      image_1024: member.json.profile.image_1024,
    };

    return memberDto;
  }
}
