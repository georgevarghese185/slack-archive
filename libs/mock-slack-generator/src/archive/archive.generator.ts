import type { Archive, ArchiveThread } from './archive';
import { MemberGenerator, Member } from '../member';
import { RandomGenerator } from '../random';
import { ConversationGenerator } from '../conversation';
import {
  Message,
  MessageGenerator,
  PostMessage,
  ThreadMessage,
  toSlackTs,
} from '../message';
import type { ArchiveConversation } from './archive';

const compareTs = (a: Message, b: Message) => {
  if (a.ts > b.ts) {
    return 1;
  } else if (b.ts > a.ts) {
    return -1;
  } else {
    return 0;
  }
};

export type ArchiveOptions = {
  randomGenerator?: RandomGenerator;
  members: number;
  conversations: number;
  messagesPerConversation: number;
  thread: {
    probability: number;
    broadcastProbabililty: number;
    maxReplies: number;
  };
};

export class ArchiveGenerator {
  private randomGenerator: RandomGenerator;

  constructor(private options: ArchiveOptions) {
    this.randomGenerator = options.randomGenerator || new RandomGenerator();
  }

  generate(): Archive {
    const teamId = this.randomGenerator.teamId();
    const members = this.generateMembers(teamId);
    const conversations = this.generateConversations(members);
    const archiveConversations: ArchiveConversation[] = conversations.map(
      (conversation) => {
        const { messages, threads } = this.generateMessages(teamId, members);
        return {
          conversation,
          messages,
          threads,
        };
      },
    );

    return {
      members,
      conversations: archiveConversations,
    };
  }

  private generateMembers(teamId: string) {
    const memberGenerator = new MemberGenerator({
      randomGenerator: this.randomGenerator,
      teamId,
    });
    return memberGenerator.generateMembers(this.options.members);
  }

  private generateConversations(members: Member[]) {
    const conversationGenerator = new ConversationGenerator({
      members,
      randomGenerator: this.randomGenerator,
    });
    return conversationGenerator.generateConversations(
      this.options.conversations,
    );
  }

  private generateMessages(teamId: string, members: Member[]) {
    let messages: PostMessage[] = [];
    const threads: ArchiveThread[] = [];
    const messageGenerator = new MessageGenerator({
      randomGenerator: this.randomGenerator,
      members,
      teamId,
    });

    for (let i = 0; i < this.options.messagesPerConversation; i++) {
      const shouldGenerateThread = this.randomGenerator.probability(
        this.options.thread.probability,
      );

      if (shouldGenerateThread) {
        const { parent, replies } = this.generateThread(messageGenerator);

        if (!replies.length) {
          continue;
        }

        const broadcasts = replies.filter(
          (m) => 'subtype' in m && m.subtype === 'thread_broadcast',
        );
        messages = messages.concat([...broadcasts, parent]);
        threads.push({ parent, replies });
      } else {
        messages.push(messageGenerator.generateMessage());
      }
    }

    return {
      messages: messages.sort(compareTs).reverse(),
      threads: threads.map(({ parent, replies }) => ({
        parent,
        replies: replies.sort(compareTs),
      })),
    };
  }

  private isFutureMessage(message: Message) {
    return message.ts > toSlackTs(Date.now());
  }

  private generateThread(messageGenerator: MessageGenerator): ArchiveThread {
    const replies: ThreadMessage[] = [];
    const threadGenerator = messageGenerator.createThreadGenerator();
    const replyCount = this.randomGenerator.number(
      1,
      this.options.thread.maxReplies,
    );

    for (let i = 0; i < replyCount; i++) {
      const shouldGenerateBroadcast = this.randomGenerator.probability(
        this.options.thread.broadcastProbabililty,
      );
      const reply = shouldGenerateBroadcast
        ? threadGenerator.generateBroadcast()
        : threadGenerator.generateReply();

      if (this.isFutureMessage(reply)) {
        break;
      }

      replies.push(reply);
    }

    const parent = threadGenerator.getParent();
    return { parent, replies };
  }
}
