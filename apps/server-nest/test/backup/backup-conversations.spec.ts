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
import { Logger } from 'src/common/logger/logger';
import { MemberBackupService } from 'src/backup/runner/member-backup.service';
import { MemberRepository } from 'src/member/member.repository';
import { MemberService } from 'src/member/member.service';
import {
  createSlackChannel,
  createSlackChannels,
} from 'test/conversation/fixture';

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
          useValue: {},
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
    conversationRepository = module.get<ConversationRepository>(
      ConversationRepository,
    );
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
    backupRespository = module.get<BackupRepository>(BackupRepository);

    jest.mocked(slackApiProvider.getMembers).mockResolvedValue({
      ok: true,
      members: [],
    });
  });

  it('should backup conversations', async () => {
    const accessToken = '1111';
    const mockChannels: Channel[] = createSlackChannels(2);

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest.mocked(slackApiProvider.getConversations).mockResolvedValueOnce({
      ok: true,
      channels: mockChannels,
    });

    await service.runBackup('1234', accessToken);

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

    expect(slackApiProvider.getConversations).toHaveBeenCalledWith({
      token: accessToken,
    });
  });

  it('should handle paginated conversations', async () => {
    const accessToken = '1111';
    const cursor = '1234';
    const mockChannel1 = createSlackChannel();
    const mockChannel2 = createSlackChannel();

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

    await service.runBackup('1234', accessToken);

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

    expect(slackApiProvider.getConversations).toHaveBeenCalledWith({
      token: accessToken,
      cursor,
    });
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
          channels: [createSlackChannel()],
          response_metadata: {
            next_cursor: '1234',
          },
        };
      });

    await service.runBackup(backupId, '1111');

    expect(backupRespository.shouldCancel).toHaveBeenCalledWith(backupId);
    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'CANCELED',
    });
  });

  it('should handle slack errors', async () => {
    const backupId = '1234';
    const slackErrorCode = 'some_error';

    jest.mocked(backupRespository.shouldCancel).mockResolvedValue(false);

    jest.mocked(slackApiProvider.getConversations).mockResolvedValueOnce({
      ok: false,
      error: slackErrorCode,
    });

    await service.runBackup(backupId, '1111');

    expect(backupRespository.update).toBeCalledWith(backupId, {
      status: 'FAILED',
      error: expect.stringContaining(slackErrorCode),
    });
  });
});
