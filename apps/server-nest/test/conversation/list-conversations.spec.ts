import { Test, TestingModule } from '@nestjs/testing';
import { Conversation } from 'src/conversation';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { createConversations } from './fixture';

describe('List Conversations', () => {
  let service: ConversationService;
  let conversationRepository: ConversationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: ConversationRepository,
          useValue: { list: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    conversationRepository = module.get<ConversationRepository>(
      ConversationRepository,
    );
  });

  it('should list conversations', async () => {
    const mockConversations: Conversation[] = createConversations(2);

    jest
      .mocked(conversationRepository.list)
      .mockResolvedValue(mockConversations);

    const conversations = await service.list();
    expect(conversations).toEqual(
      mockConversations.map((conversation) => ({
        id: conversation.id,
        name: conversation.name,
      })),
    );
  });
});
