import { Message } from 'src/slack';
import { MessageGenerator } from '@slack-archive/mock-slack-generator';

export const createSlackMessages = (n: number): Message[] => {
  return new MessageGenerator().generateMessages(n);
};
