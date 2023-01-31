export type ExchangeCodeRequest = {
  code: string;
  redirect_uri: string;
};

export type ExchangeCodeResponse = {
  access_token: string;
  user_id: string;
};

export type TestAuthRequest = {
  token: string;
};

export type RevokeAuthRequest = {
  token: string;
};

export type ConversationsRequest = {
  token: string;
  cursor?: string;
};

export type ConversationsResponse = {
  channels: Channel[];
};

export type Channel = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type MembersRequest = {
  token: string;
  cursor?: string;
};

export type MembersResponse = {
  members: Member[];
};

export type Member = {
  id: string;
  name: string;
  profile: {
    display_name: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    image_1024: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ConversationHistoryRequest = {
  token: string;
  conversationId: string;
  cursor?: string;
};

export type ConversationHistoryResponse = {
  messages: Message[];
};

export type Message = {
  ts: string;
  thread_ts?: string;
  [key: string]: unknown;
};

export type SlackApiResponse<R = unknown> =
  | {
      ok: false;
      error: string;
    }
  | ({
      ok: true;
      response_metadata?: {
        next_cursor?: string;
      };
    } & R);
