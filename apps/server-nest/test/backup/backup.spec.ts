import { Test, TestingModule } from '@nestjs/testing';
import { Backup } from 'src/backup';
import { BackupRepository } from 'src/backup/backup.repository';
import { BackupCancellationService } from 'src/backup/runner/backup-cancellation.service';
import { BackupRunnerService } from 'src/backup/runner/backup-runner.service';
import { ConversationBackupService } from 'src/backup/runner/conversation-backup.service';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { Channel } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';

const mockChannel: Channel = Object.freeze({
  id: 'C1000',
  name: 'general',
  purpose: 'War Generals only',
});

describe('Backup conversations', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
  let backupRespository: BackupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRunnerService,
        ConversationService,
        BackupCancellationService,
        ConversationBackupService,
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
          provide: SlackApiProvider,
          useValue: { getConversations: jest.fn() },
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

    jest.useFakeTimers().setSystemTime(expectedEndedAt);

    await service.runBackup(backupId);

    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'COMPLETED',
      endedAt: expectedEndedAt,
    } as Backup);
  });
});
