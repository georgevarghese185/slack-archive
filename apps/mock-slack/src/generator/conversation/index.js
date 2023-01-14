const conversationTemplate = require('./conversation.json');
const { TextGenerator } = require('../text');
const { randomItem, randomNumber } = require('../random');
const { MemberGenerator } = require('../member');
const { faker } = require('@faker-js/faker');

class ConversationGenerator {
  constructor(options = {}) {
    this.maxConversations = options.maxConversations || 5;
    this.members =
      options.members ||
      new MemberGenerator({
        maxMembers: 5,
      }).generateMembers();
    this.generated = 0;
  }

  generateConversation(isGeneral = false) {
    const textGenerator = new TextGenerator();

    const conversation = JSON.parse(JSON.stringify(conversationTemplate));

    conversation.id = 'C' + textGenerator.generateAlphaNum(8);

    conversation.name = conversation.name_normalized = isGeneral
      ? 'general'
      : faker.lorem.word();

    conversation.is_general = conversation.name === 'general';
    conversation.creator = randomItem(this.members).id;
    conversation.topic.value = faker.lorem.sentence(3);
    conversation.topic.creator = randomItem(this.members).id;
    conversation.purpose.value = faker.lorem.sentence(5);
    conversation.purpose.creator = randomItem(this.members).id;
    conversation.num_members = randomNumber(this.members.length);

    this.generated++;

    return conversation;
  }

  generateConversations() {
    const conversations = [];

    for (let i = 0; i < this.maxConversations; i++) {
      const conversation = this.generateConversation(i === 0);
      conversations.push(conversation);
    }

    return conversations;
  }
}

module.exports = {
  ConversationGenerator,
};
