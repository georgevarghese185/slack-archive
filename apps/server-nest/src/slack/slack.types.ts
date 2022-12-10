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

export type ConversationsResponse = {
  channels: Channel[];
};

export type Channel = {
  id: string;
  name: string;
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
