import { Test, TestingModule } from '@nestjs/testing';
import { BackupRunnerService } from 'src/backup/runner/backup-runner.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { Conversation } from 'src/conversation';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { Channel } from 'src/slack';
import { BackupCancellationService } from 'src/backup/runner/backup-cancellation.service';
import { ConversationBackupService } from 'src/backup/runner/conversation-backup.service';

const mockChannel1: Channel = Object.freeze({
  id: 'C1000',
  name: 'general',
  purpose: 'War Generals only',
});

const mockChannel2: Channel = Object.freeze({
  id: 'C1001',
  name: 'random',
  purpose: 'weed eater',
});

describe('Backup conversations', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
  let conversationRepository: ConversationRepository;
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
    conversationRepository = module.get<ConversationRepository>(
      ConversationRepository,
    );
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
    backupRespository = module.get<BackupRepository>(BackupRepository);
  });

  it('should backup conversations', async () => {
    const mockChannels: Channel[] = [mockChannel1, mockChannel2];

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest.mocked(slackApiProvider.getConversations).mockResolvedValueOnce({
      ok: true,
      channels: mockChannels,
    });

    await service.runBackup('1234');

    expect(conversationRepository.save).toHaveBeenCalledWith(
      mockChannels.map(
        (channel) =>
          ({
            id: channel.id,
            name: channel.name,
            json: channel,
          } as Conversation),
      ),
    );
  });

  it('should handle paginated conversations', async () => {
    const cursor = '1234';

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest
      .mocked(slackApiProvider.getConversations)
      .mockResolvedValueOnce({
        ok: true,
        channels: [mockChannel1],
        response_metadata: {
          next_cursor: cursor,
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        channels: [mockChannel2],
      });

    await service.runBackup('1234');

    expect(conversationRepository.save).toHaveBeenCalledWith([
      {
        id: mockChannel1.id,
        name: mockChannel1.name,
        json: mockChannel1,
      } as Conversation,
    ]);

    expect(conversationRepository.save).toHaveBeenCalledWith([
      {
        id: mockChannel2.id,
        name: mockChannel2.name,
        json: mockChannel2,
      } as Conversation,
    ]);

    expect(slackApiProvider.getConversations).toHaveBeenCalledWith({ cursor });
  });

  it('should handle cancellation mid-backup', async () => {
    const backupId = '1234';
    let shouldCancel = false;

    jest
      .mocked(backupRespository.shouldCancel)
      .mockImplementation(async () => shouldCancel);

    jest
      .mocked(slackApiProvider.getConversations)
      .mockImplementationOnce(async () => {
        // cancel backup
        shouldCancel = true;

        return {
          ok: true,
          channels: [mockChannel1],
          response_metadata: {
            next_cursor: '1234',
          },
        };
      });

    await service.runBackup(backupId);

    expect(backupRespository.shouldCancel).toHaveBeenCalledWith(backupId);
    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'CANCELED',
    });
  });
});
