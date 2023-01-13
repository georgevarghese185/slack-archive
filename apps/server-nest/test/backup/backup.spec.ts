import { Test, TestingModule } from '@nestjs/testing';
import { Backup } from 'src/backup';
import { BackupRepository } from 'src/backup/backup.repository';
import { BackupCancellationService } from 'src/backup/runner/backup-cancellation.service';
import { BackupRunnerService } from 'src/backup/runner/backup-runner.service';
import { ConversationBackupService } from 'src/backup/runner/conversation-backup.service';
import { MemberBackupService } from 'src/backup/runner/member-backup.service';
import { Logger } from 'src/common/logger/logger';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';
import { Channel } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';

const mockChannel: Channel = Object.freeze({
  id: 'C1000',
  name: 'general',
  purpose: 'War Generals only',
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
});

const mockMember = Object.freeze({
  id: 'UVJ5N8NND',
  name: 'darcey',
  real_name: 'Darcey Warner',
  profile: {
    display_name: 'Bret Delgado',
    image_24: 'https://slack-archive/24.png',
    image_32: 'https://slack-archive/32.png',
    image_48: 'https://slack-archive/48.png',
    image_72: 'https://slack-archive/72.png',
    image_192: 'https://slack-archive/192.png',
    image_512: 'https://slack-archive/512.png',
    image_1024: 'https://slack-archive/1024.png',
  },
});

describe('Backup', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
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
          useValue: {
            save: jest.fn(),
          },
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
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
    backupRespository = module.get<BackupRepository>(BackupRepository);
  });

  it('should start and finish a backup', async () => {
    const backupId = '1234';
    const expectedEndedAt = new Date();

    jest.mocked(slackApiProvider.getConversations).mockResolvedValueOnce({
      ok: true,
      channels: [mockChannel],
    });

    jest.mocked(slackApiProvider.getMembers).mockResolvedValueOnce({
      ok: true,
      members: [mockMember],
    });

    jest.useFakeTimers().setSystemTime(expectedEndedAt);

    await service.runBackup(backupId, '1111');

    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'COMPLETED',
      endedAt: expectedEndedAt,
    } as Backup);
  });
});
