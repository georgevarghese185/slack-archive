import { Test, TestingModule } from '@nestjs/testing';
import { BackupService } from 'src/backup/backup.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { MessageRepository } from 'src/message/message.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { Backup } from 'src/backup/backup.types';
import { MessageService } from 'src/message/message.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { BackupNotFoundError } from 'src/backup/backup.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';

const mockBackup = Object.freeze({
  id: '1234',
  backedUpConversations: [],
  conversationErrors: [],
  createdBy: 'U1234',
  currentConversation: null,
  endedAt: null,
  error: null,
  messagesBackedUp: 0,
  shouldCancel: false,
  status: 'COLLECTING_INFO',
  startedAt: expect.any(Date),
} as Backup);

describe('Get Backup', () => {
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
          useValue: { getActive: jest.fn(), findById: jest.fn() },
        },
        { provide: MessageRepository, useValue: {} },
        { provide: ConversationRepository, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
    backupRepository = module.get<BackupRepository>(BackupRepository);
  });

  it('should get running backup', async () => {
    jest.mocked(backupRepository.getActive).mockResolvedValueOnce(mockBackup);
    const backup = await service.getRunning();
    expect(backup).toEqual({
      id: mockBackup.id,
      status: mockBackup.status,
      error: mockBackup.error,
      messagesBackedUp: mockBackup.messagesBackedUp,
      currentConversation: mockBackup.currentConversation,
      backedUpConversations: mockBackup.backedUpConversations,
    });
  });

  it('should return null when there is no running backup', async () => {
    jest.mocked(backupRepository.getActive).mockResolvedValueOnce(null);
    const backup = await service.getRunning();
    expect(backup).toEqual(null);
  });

  it('should get backup by id', async () => {
    jest.mocked(backupRepository.findById).mockResolvedValueOnce(mockBackup);
    const backup = await service.get(mockBackup.id);
    expect(backup).toEqual({
      id: mockBackup.id,
      status: mockBackup.status,
      error: mockBackup.error,
      messagesBackedUp: mockBackup.messagesBackedUp,
      currentConversation: mockBackup.currentConversation,
      backedUpConversations: mockBackup.backedUpConversations,
    });
    expect(backupRepository.findById).toHaveBeenCalledWith(mockBackup.id);
  });

  it('should throw error when backup with given id cannot be found', async () => {
    jest.mocked(backupRepository.findById).mockResolvedValueOnce(null);
    await expect(service.get(mockBackup.id)).rejects.toBeInstanceOf(
      BackupNotFoundError,
    );
  });
});
