import { Test, TestingModule } from '@nestjs/testing';
import { BackupRunnerService } from 'src/backup/runner/backup-runner.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { Member, SlackApiError } from 'src/slack';
import { BackupCancellationService } from 'src/backup/runner/backup-cancellation.service';
import { ConversationBackupService } from 'src/backup/runner/conversation-backup.service';
import { MemberRepository } from 'src/member/member.repository';
import { Logger } from 'src/common/logger/logger';
import { MemberBackupService } from 'src/backup/runner/member-backup.service';
import { MemberService } from 'src/member/member.service';
import { createSlackMember, createSlackMembers } from 'test/member/fixture';

describe('Backup members', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
  let memberRepository: MemberRepository;
  let backupRespository: BackupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRunnerService,
        ConversationService,
        MemberService,
        BackupCancellationService,
        ConversationBackupService,
        MemberBackupService,
        {
          provide: BackupRepository,
          useValue: { update: jest.fn(), shouldCancel: jest.fn() },
        },
        {
          provide: ConversationRepository,
          useValue: {},
        },
        {
          provide: MemberRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: SlackApiProvider,
          useValue: { getConversations: jest.fn(), getMembers: jest.fn() },
        },
        {
          provide: Logger,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BackupRunnerService>(BackupRunnerService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
    backupRespository = module.get<BackupRepository>(BackupRepository);

    jest.mocked(slackApiProvider.getConversations).mockResolvedValueOnce({
      ok: true,
      channels: [],
    });
  });

  it('should backup members', async () => {
    const accessToken = '1111';
    const mockMembers: Member[] = createSlackMembers(2);

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest.mocked(slackApiProvider.getMembers).mockResolvedValueOnce({
      ok: true,
      members: mockMembers,
    });

    await service.runBackup('1234', accessToken);

    expect(memberRepository.save).toHaveBeenCalledWith(
      mockMembers.map((member) => ({
        id: member.id,
        name: member.name,
        json: member,
      })),
    );

    expect(slackApiProvider.getMembers).toHaveBeenCalledWith({
      token: accessToken,
    });
  });

  it('should handle paginated members', async () => {
    const accessToken = '1111';
    const cursor = '1234';
    const mockMember1 = createSlackMember();
    const mockMember2 = createSlackMember();

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest
      .mocked(slackApiProvider.getMembers)
      .mockResolvedValueOnce({
        ok: true,
        members: [mockMember1],
        response_metadata: {
          next_cursor: cursor,
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        members: [mockMember2],
      });

    await service.runBackup('1234', accessToken);

    expect(memberRepository.save).toHaveBeenCalledWith([
      {
        id: mockMember1.id,
        name: mockMember1.name,
        json: mockMember1,
      },
    ]);

    expect(memberRepository.save).toHaveBeenCalledWith([
      {
        id: mockMember2.id,
        name: mockMember2.name,
        json: mockMember2,
      },
    ]);

    expect(slackApiProvider.getMembers).toHaveBeenCalledWith({
      token: accessToken,
      cursor,
    });
  });

  it('should handle cancellation mid-backup', async () => {
    const accessToken = '1111';
    const backupId = '1234';
    let shouldCancel = false;

    jest
      .mocked(backupRespository.shouldCancel)
      .mockImplementation(async () => shouldCancel);

    jest
      .mocked(slackApiProvider.getMembers)
      .mockImplementationOnce(async () => {
        // cancel backup
        shouldCancel = true;

        return {
          ok: true,
          members: [createSlackMember()],
          response_metadata: {
            next_cursor: '1234',
          },
        };
      });

    await service.runBackup(backupId, accessToken);

    expect(backupRespository.shouldCancel).toHaveBeenCalledWith(backupId);
    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'CANCELED',
    });
  });

  it('should handle slack errors', async () => {
    const slackErrorCode = 'some_error';

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest.mocked(slackApiProvider.getMembers).mockResolvedValueOnce({
      ok: false,
      error: slackErrorCode,
    });

    await expect(service.runBackup('1234', '1111')).rejects.toEqual(
      new SlackApiError(slackErrorCode, '/api/users.list'),
    );
  });
});
