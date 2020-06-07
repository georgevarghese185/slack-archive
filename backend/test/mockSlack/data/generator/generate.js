const fs = require('fs')
const path = require('path')
const { MemberGenerator } = require('./member');
const { ConversationGenerator } = require('./conversation');
const { MessageGenerator } = require('./message');
const { TextGenerator } = require('./text');

const TEAM_ID = 'T' + new TextGenerator().generateAlphaNum(8)
const RANDOM_TIME_MIN = 5 * 1000
const RANDOM_TIME_MAX = 48 * 60 * 60 * 1000
const MAX_MEMBERS = 10
const MAX_CONVERSATIONS = 5
const MAX_MESSAGES = 500
const MAX_REPLIES = 120
const THREAD_PROBABILITY = 0.01
const THREAD_BROADCAST_PROBABILITY = 0.005

const writeJsonFile = (file, json) => {
    fs.writeFile(file, JSON.stringify(json, null, 2), () => {})
}

console.log(`Generating members...`);
const members = new MemberGenerator({ maxMembers: MAX_MEMBERS, teamId: TEAM_ID }).generateMembers();

console.log(`Generating conversations...`)
const conversations = new ConversationGenerator({ maxConversations: MAX_CONVERSATIONS, members }).generateConversations();

console.log(`Generating messages...`);
const messageGenerator = new MessageGenerator({
    members,
    teamId: TEAM_ID,
    maxMessages: MAX_MESSAGES,
    maxReplies: MAX_REPLIES,
    maxTimeDiff: RANDOM_TIME_MAX,
    minTimeDiff: RANDOM_TIME_MIN,
    threadProbability: THREAD_PROBABILITY,
    broadcastProbability: THREAD_BROADCAST_PROBABILITY
});

const { messages, replies } = conversations.reduce(
    ({ messages, replies }, conversation) => {
        const generated = messageGenerator.generateMessages();
        messages[conversation.id] = generated.messages
        replies[conversation.id] = generated.replies
        return { messages, replies }
    },
    { messages: {}, replies: {} }
)

writeJsonFile(path.resolve(__dirname, '../conversations.json'), { conversations })
writeJsonFile(path.resolve(__dirname, '../members.json'), { members })
writeJsonFile(path.resolve(__dirname, '../messages.json'), messages)
writeJsonFile(path.resolve(__dirname, '../replies.json'), replies)
