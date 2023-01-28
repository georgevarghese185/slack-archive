import { Test, TestingModule } from '@nestjs/testing';
import { MemberNotFoundError } from 'src/member';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';
import { createMember } from './fixture';

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
    const mockMember = createMember();

    jest.mocked(memberRepository.findById).mockResolvedValueOnce(mockMember);

    const member = await service.get(mockMember.id);

    expect(member).toEqual(mockMember);
  });

  it('should throw error for inavlid id', async () => {
    jest.mocked(memberRepository.findById).mockResolvedValueOnce(null);

    await expect(service.get('1234')).rejects.toThrow(MemberNotFoundError);
  });
});
