import { Test, TestingModule } from '@nestjs/testing';
import { BackupRunnerService } from 'src/backup/backup-runner.service';
import { BackupRepository } from 'src/backup/backup.repository';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { Conversation } from 'src/conversation/conversation.types';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { Channel } from 'src/slack/slack.types';

describe('Backup conversations', () => {
  let service: BackupRunnerService;
  let slackApiProvider: SlackApiProvider;
  let conversationRepository: ConversationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRunnerService,
        ConversationService,
        {
          provide: BackupRepository,
          useValue: { save: jest.fn(), getActive: jest.fn() },
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
  });

  it('should backup conversations', async () => {
    const mockChannels: Channel[] = [
      {
        id: 'C1000',
        name: 'general',
        purpose: 'War Generals only',
      },
      {
        id: 'C1001',
        name: 'random',
        purpose: 'weed eater',
      },
    ];

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
});
