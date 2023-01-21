import type { Member, MemberGenerator } from '../member';
import type { RandomGenerator } from '../random';
import { MessageGenerator } from './message.generator';
import { TimestampGenerator } from './timestamp.generator';

const randomGenerator = {
  message: jest.fn(),
  memberId: jest.fn(),
  teamId: jest.fn(),
  number: jest.fn(),
  item: jest.fn(),
} as unknown as RandomGenerator;
const memberGenerator = {
  generateMembers: jest.fn(),
} as unknown as MemberGenerator;

describe('MessageGenerator', () => {
  it('should generate message', () => {
    jest.mocked(randomGenerator.message).mockReturnValue('Hello!');
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');
    jest.mocked(randomGenerator.number).mockReturnValue(1000);
    jest
      .mocked(memberGenerator.generateMembers)
      .mockReturnValue([{ id: 'UA101' } as Member]);
    jest.mocked(randomGenerator.item).mockImplementation((list) => list[0]);

    const message = new MessageGenerator({
      randomGenerator,
      timestampGenerator: new TimestampGenerator({
        minTimeDiffMillis: 500,
        maxTimeDiffMillis: 1000,
        randomGenerator,
        startTime: new Date(1600000010000),
      }),
      memberGenerator,
    }).generateMessage();

    expect(message).toEqual(
      expect.objectContaining({
        text: 'Hello!',
        type: 'message',
        user: 'UA101',
        ts: '1600000009.000000',
        team: 'T1001',
      }),
    );

    expect(randomGenerator.number).toBeCalledWith(500, 1000);
  });

  it('should generate multiple messages', () => {
    jest
      .mocked(randomGenerator.message)
      .mockReturnValueOnce('Hello!')
      .mockReturnValueOnce('Hi!');
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');
    jest.mocked(randomGenerator.number).mockReturnValue(1000);
    jest
      .mocked(memberGenerator.generateMembers)
      .mockReturnValue([{ id: 'UA101' }, { id: 'UA102' }] as Member[]);
    jest
      .mocked(randomGenerator.item)
      .mockImplementationOnce((list) => list[0])
      .mockImplementationOnce((list) => list[1]);

    const messages = new MessageGenerator({
      randomGenerator,
      timestampGenerator: new TimestampGenerator({
        minTimeDiffMillis: 500,
        maxTimeDiffMillis: 1000,
        randomGenerator,
        startTime: new Date(1600000010000),
      }),
      memberGenerator,
    }).generateMessages(2);

    expect(messages).toEqual([
      expect.objectContaining({
        text: 'Hello!',
        type: 'message',
        user: 'UA101',
        ts: '1600000009.000000',
        team: 'T1001',
      }),
      expect.objectContaining({
        text: 'Hi!',
        type: 'message',
        user: 'UA102',
        ts: '1600000008.000000',
        team: 'T1001',
      }),
    ]);

    expect(randomGenerator.number).toBeCalledWith(500, 1000);
  });

  it('should generate thread', () => {
    jest
      .mocked(randomGenerator.message)
      .mockReturnValueOnce('Hello!')
      .mockReturnValueOnce('Hi!')
      .mockReturnValueOnce('Howdy!')
      .mockReturnValueOnce('Howdy again!');
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');
    jest
      .mocked(randomGenerator.number)
      .mockReturnValueOnce(10000)
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1000);
    jest
      .mocked(memberGenerator.generateMembers)
      .mockReturnValue([
        { id: 'UA101' },
        { id: 'UA102' },
        { id: 'UA103' },
      ] as Member[]);
    jest
      .mocked(randomGenerator.item)
      .mockImplementationOnce((list) => list[0])
      .mockImplementationOnce((list) => list[1])
      .mockImplementationOnce((list) => list[2])
      .mockImplementationOnce((list) => list[2]);

    const threadGenerator = new MessageGenerator({
      randomGenerator,
      timestampGenerator: new TimestampGenerator({
        minTimeDiffMillis: 500,
        maxTimeDiffMillis: 1000,
        randomGenerator,
        startTime: new Date(1600000010000),
      }),
      memberGenerator,
    }).createThreadGenerator();

    const replies = [
      threadGenerator.generateReply(),
      threadGenerator.generateReply(),
      threadGenerator.generateReply(),
    ];
    const parent = threadGenerator.getParent();

    expect(parent).toEqual(
      expect.objectContaining({
        text: 'Hello!',
        type: 'message',
        user: 'UA101',
        ts: '1600000000.000000',
        team: 'T1001',
        thread_ts: '1600000000.000000',
        reply_count: 3,
        reply_users_count: 2,
      }),
    );

    expect(replies[0]).toEqual(
      expect.objectContaining({
        text: 'Hi!',
        type: 'message',
        user: 'UA102',
        ts: '1600000001.000000',
        team: 'T1001',
        thread_ts: '1600000000.000000',
        parent_user_id: 'UA101',
      }),
    );

    expect(replies[1]).toEqual(
      expect.objectContaining({
        text: 'Howdy!',
        type: 'message',
        user: 'UA103',
        ts: '1600000002.000000',
        team: 'T1001',
        thread_ts: '1600000000.000000',
        parent_user_id: 'UA101',
      }),
    );

    expect(replies[2]).toEqual(
      expect.objectContaining({
        text: 'Howdy again!',
        type: 'message',
        user: 'UA103',
        ts: '1600000003.000000',
        team: 'T1001',
        thread_ts: '1600000000.000000',
        parent_user_id: 'UA101',
      }),
    );
  });

  it('should generate thread broadcast', () => {
    jest
      .mocked(randomGenerator.message)
      .mockReturnValueOnce('Hello!')
      .mockReturnValueOnce('Hi!');
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');
    jest
      .mocked(randomGenerator.number)
      .mockReturnValueOnce(10000)
      .mockReturnValueOnce(1000);
    jest
      .mocked(memberGenerator.generateMembers)
      .mockReturnValue([{ id: 'UA101' }, { id: 'UA102' }] as Member[]);
    jest
      .mocked(randomGenerator.item)
      .mockImplementationOnce((list) => list[0])
      .mockImplementationOnce((list) => list[1]);

    const threadGenerator = new MessageGenerator({
      randomGenerator,
      timestampGenerator: new TimestampGenerator({
        minTimeDiffMillis: 500,
        maxTimeDiffMillis: 1000,
        randomGenerator,
        startTime: new Date(1600000010000),
      }),
      memberGenerator,
    }).createThreadGenerator();

    const broadcast = threadGenerator.generateBroadcast();
    const parent = threadGenerator.getParent();

    expect(parent).toEqual(
      expect.objectContaining({
        text: 'Hello!',
        type: 'message',
        user: 'UA101',
        ts: '1600000000.000000',
        team: 'T1001',
        thread_ts: '1600000000.000000',
        reply_count: 1,
        reply_users_count: 1,
      }),
    );

    expect(broadcast).toEqual(
      expect.objectContaining({
        text: 'Hi!',
        type: 'message',
        subtype: 'thread_broadcast',
        user: 'UA102',
        ts: '1600000001.000000',
        thread_ts: '1600000000.000000',
        root: parent,
      }),
    );
  });

  it('should increase fractional part of timestamp when duplicates are generated', () => {
    jest.mocked(randomGenerator.message).mockReturnValue('Hello!');
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');
    jest
      .mocked(randomGenerator.number)
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);
    jest
      .mocked(memberGenerator.generateMembers)
      .mockReturnValue([{ id: 'UA101' }] as Member[]);
    jest.mocked(randomGenerator.item).mockImplementation((list) => list[0]);

    const messages = new MessageGenerator({
      randomGenerator,
      timestampGenerator: new TimestampGenerator({
        minTimeDiffMillis: 500,
        maxTimeDiffMillis: 1000,
        randomGenerator,
        startTime: new Date(1600000010000),
      }),
      memberGenerator,
    }).generateMessages(3);

    expect(messages[0]?.ts).toEqual('1600000009.000000');
    expect(messages[1]?.ts).toEqual('1600000009.000100');
    expect(messages[2]?.ts).toEqual('1600000009.000200');
  });

  it('should generate threads and messages with diverging timestamps', async () => {
    jest.mocked(randomGenerator.message).mockReturnValue('Hello!');
    jest.mocked(randomGenerator.teamId).mockReturnValue('T1001');
    jest.mocked(randomGenerator.number).mockReturnValue(1000);
    jest
      .mocked(memberGenerator.generateMembers)
      .mockReturnValue([{ id: 'UA101' }] as Member[]);
    jest.mocked(randomGenerator.item).mockImplementation((list) => list[0]);

    const messageGenerator = new MessageGenerator({
      randomGenerator,
      timestampGenerator: new TimestampGenerator({
        minTimeDiffMillis: 500,
        maxTimeDiffMillis: 1000,
        randomGenerator,
        startTime: new Date(1600000010000),
      }),
      memberGenerator,
    });

    const message1 = messageGenerator.generateMessage();
    const threadGenerator = messageGenerator.createThreadGenerator();
    const message2Thread = threadGenerator.getParent();
    const reply1 = threadGenerator.generateReply();
    const message3 = messageGenerator.generateMessage();
    const reply2broadcast = threadGenerator.generateReply();

    expect(message1.ts).toEqual('1600000009.000000');
    expect(message2Thread.ts).toEqual('1600000008.000000');
    expect(reply1.ts).toEqual('1600000009.000100');
    expect(message3.ts).toEqual('1600000007.000000');
    expect(reply2broadcast.ts).toEqual('1600000010.000000');
  });
});
