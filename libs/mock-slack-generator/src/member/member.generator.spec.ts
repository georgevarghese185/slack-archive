import type { RandomGenerator } from '../random';
import type { Member } from './member';
import { MemberGenerator } from './member.generator';

const generator = {
  memberId: jest.fn(),
  teamId: jest.fn(),
  avatar: jest.fn(),
  name: jest.fn(),
  username: jest.fn(),
} as unknown as RandomGenerator;

const mockGenerator = (
  id: string,
  teamId: string,
  firstName: string,
  lastName: string,
  username: string,
  avatar: string,
) => {
  jest.mocked(generator.memberId).mockReturnValueOnce(id);
  jest.mocked(generator.teamId).mockReturnValueOnce(teamId);
  jest.mocked(generator.avatar).mockReturnValueOnce(avatar);
  jest.mocked(generator.name).mockReturnValueOnce({ firstName, lastName });
  jest.mocked(generator.username).mockReturnValueOnce(username);
};

const assertMember = (
  member: Member,
  id: string,
  teamId: string,
  firstName: string,
  lastName: string,
  username: string,
  avatar: string,
) => {
  expect(member).toEqual(
    expect.objectContaining({
      id: id,
      team_id: teamId,
      name: username,
      real_name: `${firstName} ${lastName}`,
      profile: expect.objectContaining({
        real_name: `${firstName} ${lastName}`,
        real_name_normalized: `${firstName} ${lastName}`,
        display_name: firstName.toLowerCase(),
        display_name_normalized: firstName.toLowerCase(),
        image_original: avatar,
        first_name: firstName,
        last_name: lastName,
        image_24: avatar,
        image_32: avatar,
        image_48: avatar,
        image_72: avatar,
        image_192: avatar,
        image_512: avatar,
        image_1024: avatar,
        team: teamId,
      }),
    }),
  );
};

describe('MemberGenerator', () => {
  it('should generate a random member', () => {
    mockGenerator(
      'U1A00',
      'T1234',
      'John',
      'Smith',
      'john1234',
      'http://avatar.com/a.png',
    );

    const member = new MemberGenerator({
      randomGenerator: generator,
    }).generateMember();

    assertMember(
      member,
      'U1A00',
      'T1234',
      'John',
      'Smith',
      'john1234',
      'http://avatar.com/a.png',
    );
  });

  it('should use supplied team ID', () => {
    mockGenerator(
      'U1A00',
      'T1234',
      'John',
      'Smith',
      'john1234',
      'http://avatar.com/a.png',
    );

    const member = new MemberGenerator({
      randomGenerator: generator,
      teamId: 'T9999',
    }).generateMember();

    assertMember(
      member,
      'U1A00',
      'T9999',
      'John',
      'Smith',
      'john1234',
      'http://avatar.com/a.png',
    );
  });

  it('should generate multiple members', () => {
    mockGenerator(
      'U1A01',
      'T1001',
      'John',
      'Smith',
      'john1234',
      'http://avatar.com/a.png',
    );

    mockGenerator(
      'U1A02',
      'T1001',
      'Jill',
      'Jones',
      'jill1234',
      'http://avatar.com/b.png',
    );

    const [member1, member2] = new MemberGenerator({
      randomGenerator: generator,
    }).generateMembers(2);

    expect(member1).toBeDefined();
    expect(member2).toBeDefined();

    assertMember(
      member1 as Member,
      'U1A01',
      'T1001',
      'John',
      'Smith',
      'john1234',
      'http://avatar.com/a.png',
    );

    assertMember(
      member2 as Member,
      'U1A02',
      'T1001',
      'Jill',
      'Jones',
      'jill1234',
      'http://avatar.com/b.png',
    );
  });
});
