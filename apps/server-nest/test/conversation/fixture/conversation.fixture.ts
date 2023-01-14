import { ConversationGenerator } from '@slack-archive/mock-slack/src/generator/conversation';
import { Conversation } from 'src/conversation';
import { Channel } from 'src/slack';

const fromSlackChannel = (channel: Channel): Conversation => {
  return {
    id: channel.id,
    name: channel.name,
    json: channel,
  };
};

export const createSlackChannel = (): Channel => {
  return new ConversationGenerator().generateConversation();
};

export const createSlackChannels = (n: number): Channel[] => {
  return new ConversationGenerator({
    maxConversations: n,
  }).generateConversations();
};

export const createConversations = (n: number): Conversation[] => {
  return createSlackChannels(n).map(fromSlackChannel);
};
