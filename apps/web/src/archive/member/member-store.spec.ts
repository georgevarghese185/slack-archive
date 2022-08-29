import { MemberStore } from './member-store';
import { getMember, GetMemberResponse } from './member-api';

jest.mock('./member-api');
jest.mock('../../api/axios', () => {});

const createMockMember = () => ({
  id: 'U7QUEONPN',
  profile: {
    display_name: 'Lilliana Herman',
    image_24:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
    image_32:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
    image_48:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
    image_72:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
    image_192:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
    image_512:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
    image_1024:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chaumont02.jpg/318px-Chaumont02.jpg',
  },
});

describe('MemberStore', () => {
  it('should fetch a member from the server', async () => {
    const expectedMember = createMockMember();

    jest
      .mocked(getMember)
      .mockResolvedValue(expectedMember as GetMemberResponse);

    const member = await new MemberStore().get(expectedMember.id);

    expect(member).toEqual(expectedMember);
    expect(getMember).toBeCalledWith({ id: expectedMember.id });
  });

  it('should fetch a member from cache', async () => {
    const member = createMockMember();
    const store = new MemberStore();

    jest.mocked(getMember).mockResolvedValue(member as GetMemberResponse);

    await store.get(member.id);

    expect(store.fromCache(member.id)).toEqual(member);
  });

  it('should cache member after first fetch', async () => {
    const member = createMockMember();
    const store = new MemberStore();

    jest.mocked(getMember).mockResolvedValue(member as GetMemberResponse);

    await store.get(member.id);
    await store.get(member.id);

    expect(getMember).toBeCalledTimes(1);
  });

  it('should not make more than 1 parallel request for the same member', async () => {
    const member = createMockMember();
    const store = new MemberStore();

    jest.mocked(getMember).mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 5));
      return member as GetMemberResponse;
    });

    await Promise.all([
      store.get(member.id),
      store.get(member.id),
      store.get(member.id),
    ]);

    expect(getMember).toBeCalledTimes(1);
  });
});
