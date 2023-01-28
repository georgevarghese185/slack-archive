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
    expect(members).toEqual(mockMembers);
  });
});
