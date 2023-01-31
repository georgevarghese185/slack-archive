import { Test, TestingModule } from '@nestjs/testing';
import { BackupRunnerService } from 'src/backup/runner/backup-runner.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { ConversationBackupService } from 'src/backup/runner/conversation-backup.service';
import { MemberRepository } from 'src/member/member.repository';
import { Logger } from 'src/common/logger/logger';
import { MemberBackupService } from 'src/backup/runner/member-backup.service';
import { MemberService } from 'src/member/member.service';
import { createConversations } from 'test/conversation/fixture';
import { createSlackMessages } from 'test/message/fixture';
import { Conversation } from 'src/conversation';
import { MessageRepository } from 'src/message/message.repository';
import { MessageService } from 'src/message/message.service';
import { MessageBackupService } from 'src/backup/runner/message-backup.service';
import { BackupService } from 'src/backup/backup.service';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

describe('Backup messages', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
  let backupRepository: BackupRepository;
  let conversationRepository: ConversationRepository;
  let messageRepository: MessageRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRunnerService,
        ConversationService,
        MemberService,
        MessageService,
        BackupService,
        ConversationBackupService,
        MemberBackupService,
        MessageBackupService,
        {
          provide: BackupRepository,
          useValue: { update: jest.fn(), shouldCancel: jest.fn() },
        },
        {
          provide: ConversationRepository,
          useValue: { list: jest.fn() },
        },
        {
          provide: MemberRepository,
          useValue: {},
        },
        {
          provide: MessageRepository,
          useValue: { save: jest.fn() },
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
          provide: EventEmitter,
          useValue: {},
        },
        {
          provide: Logger,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BackupRunnerService>(BackupRunnerService);
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
    backupRepository = module.get<BackupRepository>(BackupRepository);
    messageRepository = module.get<MessageRepository>(MessageRepository);
    conversationRepository = module.get<ConversationRepository>(
      ConversationRepository,
    );

    jest.mocked(slackApiProvider.getConversations).mockResolvedValue({
      ok: true,
      channels: [],
    });

    jest.mocked(slackApiProvider.getMembers).mockResolvedValue({
      ok: true,
      members: [],
    });
  });

  it('should backup messages from conversations', async () => {
    const backupId = '1234';
    const accessToken = '1111';
    const mockConversations = createConversations(2);
    const [conversation1, conversation2] = mockConversations as [
      Conversation,
      Conversation,
    ];
    const conversation1History = createSlackMessages(5);
    const conversation2History = createSlackMessages(5);

    jest
      .mocked(conversationRepository.list)
      .mockResolvedValueOnce(mockConversations);

    jest
      .mocked(slackApiProvider.getConversationHistory)
      .mockImplementation(async ({ conversationId }) => {
        return {
          ok: true,
          messages:
            conversationId === conversation1.id
              ? conversation1History
              : conversation2History,
        };
      });

    await service.runBackup(backupId, accessToken);

    expect(messageRepository.save).toBeCalledWith(
      conversation1History.map((message) => ({
        ts: message.ts,
        conversationId: conversation1.id,
        json: message,
      })),
    );

    expect(messageRepository.save).toBeCalledWith(
      conversation2History.map((message) => ({
        ts: message.ts,
        conversationId: conversation2.id,
        json: message,
      })),
    );

    expect(slackApiProvider.getConversationHistory).toBeCalledWith({
      token: accessToken,
      conversationId: conversation1.id,
    });

    expect(slackApiProvider.getConversationHistory).toBeCalledWith({
      token: accessToken,
      conversationId: conversation2.id,
    });

    expect(backupRepository.update).toBeCalledWith(backupId, {
      status: 'BACKING_UP',
    });

    expect(backupRepository.update).toBeCalledWith(backupId, {
      currentConversation: conversation1.id,
    });
    expect(backupRepository.update).toBeCalledWith(backupId, {
      messagesBackedUp: conversation1History.length,
    });
    expect(backupRepository.update).toBeCalledWith(backupId, {
      backedUpConversations: [conversation1.id],
    });

    expect(backupRepository.update).toBeCalledWith(backupId, {
      currentConversation: conversation2.id,
    });
    expect(backupRepository.update).toBeCalledWith(backupId, {
      messagesBackedUp:
        conversation1History.length + conversation2History.length,
    });
    expect(backupRepository.update).toBeCalledWith(backupId, {
      backedUpConversations: [conversation1.id, conversation2.id],
    });
  });

  it.todo('should backup threads from conversations');

  it.todo('should handle paginated messages');

  it.todo('should handle paginated thread replies');

  it.todo('should cancel backup mid messages backup');

  it.todo('should cancel backup mid replies backup');

  it.todo('should handle errors in history API');

  it.todo('should handle errors in replies API');
});
