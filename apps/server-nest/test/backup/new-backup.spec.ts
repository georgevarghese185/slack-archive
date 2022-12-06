import { Test, TestingModule } from '@nestjs/testing';
import { BackupService } from 'src/backup/backup.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { MessageRepository } from 'src/message/message.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { Backup } from 'src/backup/backup.types';
import { MessageService } from 'src/message/message.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { BackupInProgressError } from 'src/backup/backup.errors';

describe('New Backup', () => {
  let service: BackupService;
  let backupRepository: BackupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        MessageService,
        ConversationService,
        {
          provide: BackupRepository,
          useValue: { save: jest.fn(), getActive: jest.fn() },
        },
        { provide: MessageRepository, useValue: {} },
        { provide: ConversationRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
    backupRepository = module.get<BackupRepository>(BackupRepository);
  });

  it('should create a new backup task', async () => {
    const startTime = new Date();
    const userId = 'U1234';
    const mockBackupId = '1234';
    const expectedBackup = {
      id: mockBackupId,
      backedUpConversations: [],
      conversationErrors: [],
      createdBy: userId,
      currentConversation: null,
      endedAt: null,
      error: null,
      messagesBackedUp: 0,
      shouldCancel: false,
      status: 'COLLECTING_INFO',
      startedAt: expect.any(Date),
    } as Backup;

    jest
      .mocked(backupRepository.save)
      .mockImplementationOnce(async (backup) => ({
        ...backup,
        id: mockBackupId,
      }));

    const backup = await service.startBackup(userId);

    expect(backup).toEqual(expectedBackup);

    expect(backupRepository.save).toBeCalledWith({
      backedUpConversations: expectedBackup.backedUpConversations,
      conversationErrors: expectedBackup.conversationErrors,
      createdBy: expectedBackup.createdBy,
      currentConversation: expectedBackup.currentConversation,
      endedAt: expectedBackup.endedAt,
      error: expectedBackup.error,
      messagesBackedUp: expectedBackup.messagesBackedUp,
      shouldCancel: expectedBackup.shouldCancel,
      status: expectedBackup.status,
      startedAt: expectedBackup.startedAt,
    });

    expect(backup.startedAt.getTime()).toBeGreaterThanOrEqual(
      startTime.getTime(),
    );
  });

  it('should not allow 2 backups parallel backups to run at the same time', async () => {
    const activeBackup = {
      id: '1234',
    } as Backup;

    jest.mocked(backupRepository.getActive).mockResolvedValueOnce(activeBackup);

    await expect(service.startBackup('U1234')).rejects.toBeInstanceOf(
      BackupInProgressError,
    );
  });
});
