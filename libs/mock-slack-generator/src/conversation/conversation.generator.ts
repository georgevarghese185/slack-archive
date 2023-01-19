import { Member, MemberGenerator } from '../member';
import { RandomGenerator } from '../random';
import type { Conversation } from './conversation';
import conversationTemplate from './conversation.template.json';

export type ConversationGeneratorOptions = {
  members?: Member[];
  memberGenerator?: MemberGenerator;
  randomGenerator?: RandomGenerator;
};

export class ConversationGenerator {
  private randomGenerator: RandomGenerator;
  private members: Member[];

  constructor(options: ConversationGeneratorOptions = {}) {
    this.randomGenerator = options.randomGenerator || new RandomGenerator();

    const memberGenerator =
      options.memberGenerator ||
      new MemberGenerator({ randomGenerator: this.randomGenerator });
    this.members = options.members || memberGenerator.generateMembers(5);
  }

  generateConversation(isGeneral = false): Conversation {
    const conversation = JSON.parse(JSON.stringify(conversationTemplate));

    conversation.id = this.randomGenerator.channelId();

    conversation.name = isGeneral
      ? 'general'
      : this.randomGenerator.channelName();

    conversation.is_general = isGeneral;
    conversation.creator = this.randomGenerator.item(this.members).id;
    conversation.topic.value = this.randomGenerator.conversationTopic();
    conversation.topic.creator = this.randomGenerator.item(this.members).id;
    conversation.purpose.value = this.randomGenerator.conversationPurpose();
    conversation.purpose.creator = this.randomGenerator.item(this.members).id;
    conversation.num_members = this.members.length;

    return conversation;
  }

  generateConversations(n: number): Conversation[] {
    return [
      this.generateConversation(true),
      ...new Array(n - 1).fill(null).map(() => this.generateConversation()),
    ];
  }
}
