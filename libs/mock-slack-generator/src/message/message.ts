export type PlainMessage = {
  client_msg_id: string;
  type: 'message';
  text: string;
  user: string;
  ts: string;
  team: string;
};

export interface ThreadParentMessage extends PlainMessage {
  thread_ts: string;
  reply_count: number;
  reply_users_count: number;
  latest_reply: string;
  reply_users: string[];
  subscribed: boolean;
  last_read: string;
}

export interface ThreadReplyMessage extends PlainMessage {
  thread_ts: string;
  parent_user_id: string;
}

export interface ThreadBroadcastMessage extends PlainMessage {
  subtype: 'thread_broadcast';
  thread_ts: string;
  root: ThreadParentMessage;
  client_msg_id: string;
}

export type PostMessage =
  | PlainMessage
  | ThreadParentMessage
  | ThreadBroadcastMessage;

export type ThreadMessage = ThreadReplyMessage | ThreadBroadcastMessage;

export type Message =
  | PlainMessage
  | ThreadParentMessage
  | ThreadReplyMessage
  | ThreadBroadcastMessage;
