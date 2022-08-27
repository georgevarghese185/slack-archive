import { getTimestampTime } from '../../slack';

export type Message = {
  ts: string;
  user: string;
  text: string;
};

export const getTime = (message: Message) => {
  return getTimestampTime(message.ts);
};
