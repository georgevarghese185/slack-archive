import { Test, TestingModule } from '@nestjs/testing';
import { BackupService } from 'src/backup/backup.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { MessageRepository } from 'src/message/message.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { BackupStatus } from 'src/backup/backup.types';
import { MessageService } from 'src/message/message.service';
import { ConversationService } from 'src/conversation/conversation.service';

describe('Backup', () => {
  let service: BackupService;
  let backupRepository: BackupRepository;
  let messageRepository: MessageRepository;
  let conversationRepository: ConversationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        MessageService,
        ConversationService,
        { provide: BackupRepository, useValue: { getLast: jest.fn() } },
        { provide: MessageRepository, useValue: { getCount: jest.fn() } },
        { provide: ConversationRepository, useValue: { getCount: jest.fn() } },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
    backupRepository = module.get<BackupRepository>(BackupRepository);
    messageRepository = module.get<MessageRepository>(MessageRepository);
    conversationRepository = module.get<ConversationRepository>(
      ConversationRepository,
    );
  });

  it('should return backup status', async () => {
    const messagesCount = 100;
    const conversationsCount = 5;
    const mockBackup = {
      id: '1234-1234',
      createdBy: 'U1234',
      startedAt: new Date(),
      endedAt: new Date(),
      status: BackupStatus.Completed,
      backedUpConversations: [],
      currentConversation: null,
      messagesBackedUp: 1,
      shouldCancel: false,
      conversationErrors: [],
      error: null,
    };

    jest.mocked(backupRepository.getLast).mockResolvedValueOnce(mockBackup);
    jest
      .mocked(messageRepository.getCount)
      .mockResolvedValueOnce(messagesCount);
    jest
      .mocked(conversationRepository.getCount)
      .mockResolvedValueOnce(conversationsCount);

    const stats = await service.getBackupStatus();

    expect(stats).toEqual({
      messages: messagesCount,
      conversations: conversationsCount,
      lastBackupAt: mockBackup.endedAt,
    });
  });
});
