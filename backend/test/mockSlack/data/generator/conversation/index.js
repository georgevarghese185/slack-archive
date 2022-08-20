const conversationTemplate = require('./conversation.json');
const conversationInfo = require('./conversations.json').conversations;
const { TextGenerator } = require('../text');
const { randomItem, randomNumber } = require('../random');

class ConversationGenerator {
    constructor (options) {
        this.maxConversations = options.maxConversations;
        this.members = options.members;
        this.generated = 0;
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

        this.generated++;

        return conversation;
    }

    generateConversations () {
        const conversations = [];

        for (let i = 0; i < this.maxConversations; i++) {
            // If `this.maxConversations` is greater than the number of example conversation objects available in
            // `conversations.json`, this code will repeat the same conversations but with suffixes like '-2', '-3',
            // '-4', .... '-n' in the conversation name
            const index = i % conversationInfo.length;
            const suffix = Math.floor(i / conversationInfo.length);

            let conversation = this.generateConversation(conversationInfo[index]);

            if (suffix) {
                conversation = {
                ...conversation,
                name: `${conversation.name}-${suffix}`,
                name_normalized: `${conversation.name}-${suffix}`,
                };
            }

            conversations.push(conversation);
        }

        return conversations;
    }
}

module.exports = {
    ConversationGenerator
}