import type { Member, MemberGenerator } from '../member';
import type { RandomGenerator } from '../random';
import { ConversationGenerator } from './conversation.generator';

const randomGenerator = {
  channelId: jest.fn(),
  channelName: jest.fn(),
  conversationTopic: jest.fn(),
  conversationPurpose: jest.fn(),
  item: jest.fn(),
  teamId: jest.fn(),
} as unknown as RandomGenerator;

const memberGenerator = {
  generateMembers: jest.fn(),
} as unknown as MemberGenerator;

describe('ConversationGenerator', () => {
  it('should generate random conversation', () => {
    const creator = { id: 'U1001' } as Member;
    const topicSetter = { id: 'U1002' } as Member;
    const purposeSetter = { id: 'U1003' } as Member;
    const members = [creator, topicSetter, purposeSetter];

    jest.mocked(randomGenerator.channelId).mockReturnValue('CA001');
    jest.mocked(randomGenerator.channelName).mockReturnValue('random');
    jest.mocked(randomGenerator.conversationTopic).mockReturnValue('Be random');
    jest
      .mocked(randomGenerator.conversationPurpose)
      .mockReturnValue('Randomness');
    jest
      .mocked(randomGenerator.item)
      .mockReturnValueOnce(creator)
      .mockReturnValueOnce(topicSetter)
      .mockReturnValueOnce(purposeSetter);
    jest.mocked(memberGenerator.generateMembers).mockReturnValue(members);

    const conversation = new ConversationGenerator({
      randomGenerator,
      memberGenerator,
    }).generateConversation();

    expect(conversation).toEqual(
      expect.objectContaining({
        id: 'CA001',
        name: 'random',
        is_general: false,
        creator: creator.id,
        topic: expect.objectContaining({
          value: 'Be random',
          creator: topicSetter.id,
        }),
        purpose: expect.objectContaining({
          value: 'Randomness',
          creator: purposeSetter.id,
        }),
        num_members: 3,
      }),
    );

    expect(randomGenerator.item).toBeCalledWith(members);
  });

  it('should generate general channel', () => {
    const creator = { id: 'U1001' } as Member;
    const topicSetter = { id: 'U1002' } as Member;
    const purposeSetter = { id: 'U1003' } as Member;
    const members = [creator, topicSetter, purposeSetter];

    jest.mocked(randomGenerator.channelId).mockReturnValue('CA001');
    jest.mocked(randomGenerator.channelName).mockReturnValue('random');
    jest.mocked(randomGenerator.conversationTopic).mockReturnValue('Be random');
    jest
      .mocked(randomGenerator.conversationPurpose)
      .mockReturnValue('Randomness');
    jest
      .mocked(randomGenerator.item)
      .mockReturnValueOnce(creator)
      .mockReturnValueOnce(topicSetter)
      .mockReturnValueOnce(purposeSetter);
    jest.mocked(memberGenerator.generateMembers).mockReturnValue(members);
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');

    const conversation = new ConversationGenerator({
      randomGenerator,
      memberGenerator,
    }).generateConversation(true);

    expect(conversation.name).toEqual('general');
    expect(conversation.is_general).toEqual(true);
  });

  it('should generate multiple conversations', () => {
    const generalCreator = { id: 'U1001' } as Member;
    const randomCreator = { id: 'U1002' } as Member;
    const generalTopicSetter = { id: 'U1003' } as Member;
    const randomTopicSetter = { id: 'U1004' } as Member;
    const generalPurposeSetter = { id: 'U1005' } as Member;
    const randomPurposeSetter = { id: 'U1006' } as Member;
    const members = [
      generalCreator,
      randomCreator,
      generalTopicSetter,
      randomTopicSetter,
      generalPurposeSetter,
      randomPurposeSetter,
    ];

    jest
      .mocked(randomGenerator.channelId)
      .mockReturnValueOnce('CA001')
      .mockReturnValueOnce('CA002');
    jest.mocked(randomGenerator.channelName).mockReturnValueOnce('random');
    jest
      .mocked(randomGenerator.conversationTopic)
      .mockReturnValueOnce('Be general')
      .mockReturnValueOnce('Be random');
    jest
      .mocked(randomGenerator.conversationPurpose)
      .mockReturnValueOnce('Generality')
      .mockReturnValueOnce('Randomness');
    jest
      .mocked(randomGenerator.item)
      .mockReturnValueOnce(generalCreator)
      .mockReturnValueOnce(generalTopicSetter)
      .mockReturnValueOnce(generalPurposeSetter)
      .mockReturnValueOnce(randomCreator)
      .mockReturnValueOnce(randomTopicSetter)
      .mockReturnValueOnce(randomPurposeSetter);
    jest.mocked(memberGenerator.generateMembers).mockReturnValue(members);

    const conversations = new ConversationGenerator({
      randomGenerator,
      memberGenerator,
    }).generateConversations(2);

    expect(conversations[0]).toEqual(
      expect.objectContaining({
        id: 'CA001',
        name: 'general',
        is_general: true,
        creator: generalCreator.id,
        topic: expect.objectContaining({
          value: 'Be general',
          creator: generalTopicSetter.id,
        }),
        purpose: expect.objectContaining({
          value: 'Generality',
          creator: generalPurposeSetter.id,
        }),
        num_members: 6,
      }),
    );

    expect(conversations[1]).toEqual(
      expect.objectContaining({
        id: 'CA002',
        name: 'random',
        is_general: false,
        creator: randomCreator.id,
        topic: expect.objectContaining({
          value: 'Be random',
          creator: randomTopicSetter.id,
        }),
        purpose: expect.objectContaining({
          value: 'Randomness',
          creator: randomPurposeSetter.id,
        }),
        num_members: 6,
      }),
    );
  });

  it('should use supplied list of members', () => {
    const creator = { id: 'U1001' } as Member;
    const topicSetter = { id: 'U1002' } as Member;
    const purposeSetter = { id: 'U1003' } as Member;
    const members = [creator, topicSetter, purposeSetter];

    jest.mocked(randomGenerator.channelId).mockReturnValue('CA001');
    jest.mocked(randomGenerator.channelName).mockReturnValue('random');
    jest.mocked(randomGenerator.conversationTopic).mockReturnValue('Be random');
    jest
      .mocked(randomGenerator.conversationPurpose)
      .mockReturnValue('Randomness');
    jest
      .mocked(randomGenerator.item)
      .mockReturnValueOnce(creator)
      .mockReturnValueOnce(topicSetter)
      .mockReturnValueOnce(purposeSetter);

    const conversation = new ConversationGenerator({
      randomGenerator,
      members,
    }).generateConversation();

    expect(conversation).toEqual(
      expect.objectContaining({
        id: 'CA001',
        name: 'random',
        is_general: false,
        creator: creator.id,
        topic: expect.objectContaining({
          value: 'Be random',
          creator: topicSetter.id,
        }),
        purpose: expect.objectContaining({
          value: 'Randomness',
          creator: purposeSetter.id,
        }),
        num_members: 3,
      }),
    );

    expect(randomGenerator.item).toBeCalledWith(members);
  });
});
