import { ArchiveGenerator } from '.';
import { RandomGenerator } from '../random';

describe('ArchiveGenerator', () => {
  it('should generate archive', () => {
    const { members, conversations } = new ArchiveGenerator({
      members: 5,
      conversations: 10,
      messagesPerConversation: 20,
      thread: {
        maxReplies: 0,
        probability: 0,
        broadcastProbabililty: 0,
      },
    }).generate();

    expect(members).toHaveLength(5);
    expect(conversations).toHaveLength(10);

    const memberIds = members.map((member) => member.id);
    conversations.forEach((conversation) => {
      expect(memberIds).toContain(conversation.conversation.creator);
      expect(memberIds).toContain(conversation.conversation.purpose.creator);
      expect(memberIds).toContain(conversation.conversation.topic.creator);

      expect(conversation.messages).toHaveLength(20);
    });
  });

  it('should generate threads', () => {
    const randomGenerator = new RandomGenerator();
    jest.spyOn(randomGenerator, 'probability');
    jest.spyOn(randomGenerator, 'number');

    jest
      .mocked(randomGenerator.probability)
      .mockReturnValueOnce(false) // don't generate thread as first message
      .mockReturnValueOnce(true) // generate thread as second message
      .mockReturnValueOnce(false) // don't generate thread broadcast as first reply
      .mockReturnValueOnce(true); // generate thread broadcast as second reply

    jest.mocked(randomGenerator.number).mockImplementation((min, max) => {
      if (min === 1 && max === 2) {
        // this should be the generator deciding how many replies to put in the thread
        return 2;
      } else {
        return new RandomGenerator().number(min, max);
      }
    });

    const { conversations } = new ArchiveGenerator({
      randomGenerator,
      members: 5,
      conversations: 1,
      messagesPerConversation: 2,
      thread: {
        maxReplies: 2,
        probability: 0.25,
        broadcastProbabililty: 0.75,
      },
    }).generate();

    expect(conversations[0]?.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'message',
          subtype: 'thread_broadcast',
        }),
        expect.objectContaining({ type: 'message' }),
        expect.objectContaining({ type: 'message', reply_count: 2 }),
      ]),
    );
    expect(conversations[0]?.messages).toHaveLength(3);

    expect(conversations[0]?.threads).toEqual([
      {
        parent: expect.objectContaining({ type: 'message', reply_count: 2 }),
        replies: expect.arrayContaining([
          expect.objectContaining({
            type: 'message',
            subtype: 'thread_broadcast',
          }),
          expect.objectContaining({ type: 'message' }),
        ]),
      },
    ]);
    expect(conversations[0]?.threads).toHaveLength(1);
    expect(conversations[0]?.threads[0]?.replies).toHaveLength(2);

    expect(randomGenerator.probability).toBeCalledWith(0.25);
    expect(randomGenerator.probability).toBeCalledWith(0.75);
  });

  it('should return replies in chronological order and messages in reverse chronological order', () => {
    const { conversations } = new ArchiveGenerator({
      members: 5,
      conversations: 1,
      messagesPerConversation: 100,
      thread: {
        maxReplies: 25,
        probability: 0.25,
        broadcastProbabililty: 0.25,
      },
    }).generate();

    expect(
      conversations[0]?.messages.every((message, i, messages) => {
        const nextMessage = messages[i + 1];
        if (!nextMessage) {
          return true;
        }
        return message.ts > nextMessage.ts;
      }),
    ).toBe(true);

    expect(
      conversations[0]?.threads.every((thread) =>
        thread.replies.every((reply, i, replies) => {
          const nextReply = replies[i + 1];
          if (!nextReply) {
            return true;
          }
          return reply.ts < nextReply.ts;
        }),
      ),
    ).toBe(true);
  });

  it('should not generate messages newer than current time', () => {
    const currentTimestamp =
      Math.floor(new Date().getTime() / 1000) + '.000000';

    const { conversations } = new ArchiveGenerator({
      members: 5,
      conversations: 1,
      messagesPerConversation: 10,
      thread: {
        maxReplies: 50,
        probability: 0.5,
        broadcastProbabililty: 0.5,
      },
    }).generate();

    expect(
      conversations[0]?.messages.every((m) => m.ts < currentTimestamp),
    ).toBe(true);
    expect(
      conversations[0]?.threads
        .flatMap((t) => [t.parent, ...t.replies])
        .every((m) => m.ts < currentTimestamp),
    ).toBe(true);
  });
});
