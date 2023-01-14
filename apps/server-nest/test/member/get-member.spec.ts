import { Test, TestingModule } from '@nestjs/testing';
import { MemberNotFoundError } from 'src/member';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';

describe('Get Member', () => {
  let service: MemberService;
  let memberRepository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: MemberRepository,
          useValue: { list: jest.fn(), findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
  });

  it('should get member by id', async () => {
    const mockMember = {
      id: 'UVJ5N8NND',
      name: 'darcey',
      json: {
        id: 'UVJ5N8NND',
        name: 'darcey',
        real_name: 'Darcey Warner',
        profile: {
          display_name: 'Darcey Warner',
          image_24: 'https://slack-archive/24.png',
          image_32: 'https://slack-archive/32.png',
          image_48: 'https://slack-archive/48.png',
          image_72: 'https://slack-archive/72.png',
          image_192: 'https://slack-archive/192.png',
          image_512: 'https://slack-archive/512.png',
          image_1024: 'https://slack-archive/1024.png',
        },
      },
    };

    jest.mocked(memberRepository.findById).mockResolvedValueOnce(mockMember);

    const member = await service.get(mockMember.id);

    expect(member).toEqual({
      id: mockMember.id,
      profile: {
        display_name: mockMember.json.profile.display_name,
        image_24: mockMember.json.profile.image_24,
        image_32: mockMember.json.profile.image_32,
        image_48: mockMember.json.profile.image_48,
        image_72: mockMember.json.profile.image_72,
        image_192: mockMember.json.profile.image_192,
        image_512: mockMember.json.profile.image_512,
        image_1024: mockMember.json.profile.image_1024,
      },
    });
  });

  it('should throw error for inavlid id', async () => {
    jest.mocked(memberRepository.findById).mockResolvedValueOnce(null);

    await expect(service.get('1234')).rejects.toThrow(MemberNotFoundError);
  });
});
