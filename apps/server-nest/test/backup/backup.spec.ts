import { Test, TestingModule } from '@nestjs/testing';
import { Backup } from 'src/backup';
import { BackupRepository } from 'src/backup/backup.repository';
import { BackupCancellationService } from 'src/backup/runner/backup-cancellation.service';
import { BackupRunnerService } from 'src/backup/runner/backup-runner.service';
import { ConversationBackupService } from 'src/backup/runner/conversation-backup.service';
import { MemberBackupService } from 'src/backup/runner/member-backup.service';
import { MessageBackupService } from 'src/backup/runner/message-backup.service';
import { Logger } from 'src/common/logger/logger';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';
import { MessageRepository } from 'src/message/message.repository';
import { MessageService } from 'src/message/message.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import {
  createConversations,
  createSlackChannels,
} from 'test/conversation/fixture';
import { createSlackMembers } from 'test/member/fixture';
import { createSlackMessages } from 'test/message/fixture';

describe('Backup', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
  let conversationRespository: ConversationRepository;
  let backupRespository: BackupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRunnerService,
        ConversationService,
        MemberService,
        MessageService,
        BackupCancellationService,
        ConversationBackupService,
        MemberBackupService,
        MessageBackupService,
        {
          provide: BackupRepository,
          useValue: { update: jest.fn(), shouldCancel: jest.fn() },
        },
        {
          provide: ConversationRepository,
          useValue: {
            save: jest.fn(),
            list: jest.fn(),
          },
        },
        {
          provide: MemberRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: MessageRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: SlackApiProvider,
          useValue: {
            getConversations: jest.fn(),
            getMembers: jest.fn(),
            getConversationHistory: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BackupRunnerService>(BackupRunnerService);
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
    conversationRespository = module.get<ConversationRepository>(
      ConversationRepository,
    );
    backupRespository = module.get<BackupRepository>(BackupRepository);
  });

  it('should start and finish a backup', async () => {
    const backupId = '1234';
    const expectedEndedAt = new Date();

    jest.mocked(slackApiProvider.getConversations).mockResolvedValueOnce({
      ok: true,
      channels: createSlackChannels(1),
    });

    jest.mocked(slackApiProvider.getMembers).mockResolvedValueOnce({
      ok: true,
      members: createSlackMembers(1),
    });

    jest
      .mocked(conversationRespository.list)
      .mockResolvedValueOnce(createConversations(1));

    jest.mocked(slackApiProvider.getConversationHistory).mockResolvedValueOnce({
      ok: true,
      messages: createSlackMessages(2),
    });

    jest.useFakeTimers().setSystemTime(expectedEndedAt);

    await service.runBackup(backupId, '1111');

    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'COMPLETED',
      endedAt: expectedEndedAt,
    } as Backup);
  });
});
