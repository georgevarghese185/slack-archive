const conversationTemplate = require('./conversation.json');
const conversationInfo = require('./conversations.json').conversations;
const { TextGenerator } = require('../text');
const { randomItem, randomNumber } = require('../random');

class ConversationGenerator {
    constructor (options) {
        this.maxConversations = options.maxConversations;
        this.members = options.members;
    }

    generateConversation (info) {
        const textGenerator = new TextGenerator();

        const conversation = JSON.parse(JSON.stringify(conversationTemplate));

        conversation.id = 'C' + textGenerator.generateAlphaNum(8);

        conversation.name
        = conversation.name_normalized
        = info.name;

        conversation.is_general = conversation.name === 'general';
        conversation.creator = randomItem(this.members).id;
        conversation.topic.value = info.topic;
        conversation.topic.creator = randomItem(this.members).id;
        conversation.purpose.value = info.purpose;
        conversation.purpose.creator = randomItem(this.members).id;
        conversation.num_members = randomNumber(this.members.length);

        return conversation;
    }

    generateConversations () {
        const conversations = [];

        for (let i = 0; i < this.maxConversations; i++) {
            const conversation = this.generateConversation(conversationInfo[i]);
            conversations.push(conversation);
        }

        return conversations;
    }
}

module.exports = {
    ConversationGenerator
}