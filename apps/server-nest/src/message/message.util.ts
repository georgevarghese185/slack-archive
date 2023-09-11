import { Message } from './message.types';
import { Message as SlackMessage } from 'src/slack';

export const isReply = (m: Message | SlackMessage) =>
  !!getThreadTs(m) && m.ts !== getThreadTs(m);

export const isThreadParent = (m: Message) => m.threadTs === m.ts;

export const isBroadcast = (m: Message | SlackMessage) =>
  m.subtype === 'thread_broadcast';

export const getThreadTs = (m: Message | SlackMessage) =>
  'thread_ts' in m ? m.thread_ts : m.threadTs;
