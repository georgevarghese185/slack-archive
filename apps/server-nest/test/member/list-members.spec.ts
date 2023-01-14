import { Test, TestingModule } from '@nestjs/testing';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';
import { createMembers } from './fixture';

describe('List Members', () => {
  let service: MemberService;
  let memberRepository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: MemberRepository,
          useValue: { list: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
  });

  it('should list members', async () => {
    const mockMembers = createMembers(2);

    jest.mocked(memberRepository.list).mockResolvedValue(mockMembers);

    const members = await service.list();
    expect(members).toEqual(
      mockMembers.map((mockMembers) => ({
        id: mockMembers.id,
        profile: {
          display_name: mockMembers.json.profile.display_name,
          image_24: mockMembers.json.profile.image_24,
          image_32: mockMembers.json.profile.image_32,
          image_48: mockMembers.json.profile.image_48,
          image_72: mockMembers.json.profile.image_72,
          image_192: mockMembers.json.profile.image_192,
          image_512: mockMembers.json.profile.image_512,
          image_1024: mockMembers.json.profile.image_1024,
        },
      })),
    );
  });
});
