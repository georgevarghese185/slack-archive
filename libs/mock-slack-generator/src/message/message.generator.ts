import type {
  PlainMessage,
  ThreadBroadcastMessage,
  ThreadParentMessage,
  ThreadReplyMessage,
} from './message';
import { RandomGenerator } from '../random';
import { TimestampGenerator } from './timestamp.generator';
import messageTemplate from './message.template.json';
import { Member, MemberGenerator } from '../member';
import { toMillis } from './timestamp';

export type MessageGeneratorOptions = {
  randomGenerator?: RandomGenerator;
  timestampGenerator?: TimestampGenerator;
  members?: Member[];
  memberGenerator?: MemberGenerator;
  teamId?: string;
};

export interface ThreadGenerator {
  getParent(): ThreadParentMessage;
  generateReply(): ThreadReplyMessage;
  generateBroadcast(): ThreadBroadcastMessage;
}

type ThreadGeneratorOptions = {
  randomGenerator: RandomGenerator;
  timestampGenerator: TimestampGenerator;
  members: Member[];
  teamId: string;
};

class ThreadGeneratorImpl implements ThreadGenerator {
  private messageGenerator: MessageGenerator;
  private parent: ThreadParentMessage;
  private replyUsers = new Set<string>();

  constructor(
    messageGenerator: MessageGenerator,
    options: ThreadGeneratorOptions,
  ) {
    const baseParentMessage = messageGenerator.generateMessage();
    this.parent = this.generateParent(baseParentMessage);

    this.messageGenerator = new MessageGenerator({
      members: options.members,
      randomGenerator: options.randomGenerator,
      teamId: options.teamId,
      timestampGenerator: new TimestampGenerator({
        maxTimeDiffMillis: options.timestampGenerator.maxDiff,
        minTimeDiffMillis: options.timestampGenerator.minDiff,
        randomGenerator: options.randomGenerator,
        startTime: new Date(toMillis(baseParentMessage.ts)),
        generatedTimestamps: options.timestampGenerator.generatedTimestamps,
      }),
    });
  }

  getParent(): ThreadParentMessage {
    return this.parent;
  }

  generateReply(): ThreadReplyMessage {
    const message = this.messageGenerator.generateMessage('newer');
    const reply = JSON.parse(
      JSON.stringify(messageTemplate.thread_reply),
    ) as ThreadReplyMessage;

    reply.text = message.text;
    reply.user = message.user;
    reply.ts = message.ts;
    reply.team = message.team;
    reply.thread_ts = this.parent.ts;
    reply.parent_user_id = this.parent.user;

    this.addReply(reply);

    return reply;
  }

  generateBroadcast(): ThreadBroadcastMessage {
    const message = this.messageGenerator.generateMessage('newer');
    const broadcast = JSON.parse(
      JSON.stringify(messageTemplate.thread_broadcast),
    ) as ThreadBroadcastMessage;

    broadcast.text = message.text;
    broadcast.user = message.user;
    broadcast.ts = message.ts;
    broadcast.thread_ts = this.parent.ts;
    broadcast.root = this.parent;

    this.addReply(broadcast);

    return broadcast;
  }

  private addReply(reply: ThreadReplyMessage | ThreadBroadcastMessage) {
    this.parent.reply_count += 1;
    this.replyUsers.add(reply.user);
    this.parent.reply_users_count = this.replyUsers.size;
  }

  private generateParent(base: PlainMessage) {
    const parent = JSON.parse(
      JSON.stringify(messageTemplate.thread_parent),
    ) as ThreadParentMessage;

    parent.text = base.text;
    parent.user = base.user;
    parent.ts = base.ts;
    parent.team = base.team;
    parent.thread_ts = parent.ts;
    parent.reply_count = 0;
    parent.reply_users_count = 0;

    return parent;
  }
}

export class MessageGenerator {
  private randomGenerator: RandomGenerator;
  private timestampGenerator: TimestampGenerator;
  private teamId: string;
  private members: Member[];

  constructor(options: MessageGeneratorOptions = {}) {
    this.randomGenerator = options.randomGenerator || new RandomGenerator();

    this.timestampGenerator =
      options.timestampGenerator ||
      new TimestampGenerator({ randomGenerator: this.randomGenerator });

    this.teamId = options.teamId || this.randomGenerator.teamId();

    const memberGenerator =
      options.memberGenerator ||
      new MemberGenerator({
        randomGenerator: this.randomGenerator,
        teamId: this.teamId,
      });

    this.members = options.members || memberGenerator.generateMembers(5);
  }

  generateMessage(chronology: 'newer' | 'older' = 'older'): PlainMessage {
    const message = JSON.parse(JSON.stringify(messageTemplate.plain_message));
    message.text = this.randomGenerator.message();
    message.user = this.randomGenerator.item(this.members).id;
    message.ts =
      chronology === 'older'
        ? this.timestampGenerator.older()
        : this.timestampGenerator.newer();
    message.team = this.teamId;

    return message;
  }

  generateMessages(n: number): PlainMessage[] {
    return new Array(n).fill(null).map(() => this.generateMessage());
  }

  createThreadGenerator(): ThreadGenerator {
    return new ThreadGeneratorImpl(this, {
      timestampGenerator: this.timestampGenerator,
      members: this.members,
      randomGenerator: this.randomGenerator,
      teamId: this.teamId,
    });
  }
}
