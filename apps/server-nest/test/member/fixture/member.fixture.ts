import { MemberGenerator } from '@slack-archive/mock-slack-generator';
import { Member } from 'src/member';
import { Member as SlackMember } from 'src/slack';

const fromSlackMember = (member: SlackMember): Member => ({
  id: member.id,
  name: member.name,
  json: member,
});

export const createSlackMember = (): SlackMember => {
  return new MemberGenerator().generateMember();
};

export const createMember = (): Member => {
  return fromSlackMember(createSlackMember());
};

export const createSlackMembers = (n: number): SlackMember[] => {
  return new MemberGenerator().generateMembers(n);
};

export const createMembers = (n: number): Member[] => {
  return createSlackMembers(n).map(fromSlackMember);
};
