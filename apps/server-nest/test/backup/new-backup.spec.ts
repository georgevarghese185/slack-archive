import { Test, TestingModule } from '@nestjs/testing';
import { BackupService } from 'src/backup/backup.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { MessageRepository } from 'src/message/message.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { Backup } from 'src/backup/backup.types';
import { MessageService } from 'src/message/message.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { BackupInProgressError } from 'src/backup/backup.errors';
import { BackupDto } from 'src/backup/dto/backup.dto';

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
    const userId = 'U1234';
    const mockBackupId = '1234';
    const expectedBackup = {
      id: mockBackupId,
      backedUpConversations: [],
      currentConversation: null,
      messagesBackedUp: 0,
      error: null,
      status: 'COLLECTING_INFO',
    } as BackupDto;

    jest
      .mocked(backupRepository.save)
      .mockImplementationOnce(async (backup) => ({
        ...backup,
        id: mockBackupId,
      }));

    const backup = await service.createBackup(userId);

    expect(backup).toEqual(expectedBackup);

    expect(backupRepository.save).toBeCalledWith({
      backedUpConversations: expectedBackup.backedUpConversations,
      conversationErrors: [],
      createdBy: userId,
      currentConversation: expectedBackup.currentConversation,
      endedAt: null,
      error: expectedBackup.error,
      messagesBackedUp: expectedBackup.messagesBackedUp,
      shouldCancel: false,
      status: expectedBackup.status,
      startedAt: expect.any(Date),
    });
  });

  it('should not allow 2 backups parallel backups to run at the same time', async () => {
    const activeBackup = {
      id: '1234',
    } as Backup;

    jest.mocked(backupRepository.getActive).mockResolvedValueOnce(activeBackup);

    await expect(service.createBackup('U1234')).rejects.toBeInstanceOf(
      BackupInProgressError,
    );
  });
});
