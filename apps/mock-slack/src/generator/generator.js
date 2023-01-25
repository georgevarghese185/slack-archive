const { ArchiveGenerator } = require('@slack-archive/mock-slack-generator');
const fs = require('fs');
const path = require('path');

const writeJsonFile = (file, json) => {
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
};

const generate = () => {
  console.log('Generating archive...');

  const { members, conversations } = new ArchiveGenerator({
    conversations: 5,
    members: 10,
    messagesPerConversation: 500,
    thread: {
      probability: 0.05,
      maxReplies: 120,
      broadcastProbabililty: 0.005,
    },
  }).generate();

  console.log(`Generated ${members.length} members`);

  console.log(`Generated ${conversations.length} conversations`);

  const { messages, replies, total } = conversations.reduce(
    ({ messages, replies, total }, conversation) => {
      const id = conversation.conversation.id;
      let messageIds = conversation.messages.map((m) => m.ts);

      messages[id] = conversation.messages;

      replies[id] = conversation.threads.reduce(
        (threads, { parent, replies }) => {
          messageIds = messageIds.concat(
            [, parent, ...replies].map((m) => m.ts),
          );

          return {
            ...threads,
            [parent.ts]: [parent, ...replies],
          };
        },
        {},
      );

      return { messages, replies, total: total + new Set(messageIds).size };
    },
    { messages: {}, replies: {}, total: 0 },
  );

  console.log(`Generated ${total} messages`);

  fs.mkdirSync('generated', { recursive: true });

  writeJsonFile(path.resolve('generated/conversations.json'), {
    conversations: conversations.map((c) => c.conversation),
  });
  writeJsonFile(path.resolve('generated/members.json'), { members });
  writeJsonFile(path.resolve('generated/messages.json'), messages);
  writeJsonFile(path.resolve('generated/replies.json'), replies);
};

module.exports = {
  generate,
};
