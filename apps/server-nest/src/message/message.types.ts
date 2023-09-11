export type Message = {
  conversationId: string;
  ts: string;
  threadTs?: string;
  subtype?: 'thread_broadcast' | string;
  json: object;
};
