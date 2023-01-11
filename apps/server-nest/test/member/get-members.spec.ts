import { Test, TestingModule } from '@nestjs/testing';
import { Member } from 'src/member';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';

describe('Get Members', () => {
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

  it('should get members', async () => {
    const expectedMembers: Member[] = [
      {
        id: 'UVJ5N8NND',
        name: 'darcey',
        json: {
          id: 'UVJ5N8NND',
          name: 'darcey',
          real_name: 'Darcey Warner',
        },
      },
    ];

    jest.mocked(memberRepository.list).mockResolvedValue(expectedMembers);

    const members = await service.list();
    expect(members).toEqual(expectedMembers);
  });
});
