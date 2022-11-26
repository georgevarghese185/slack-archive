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

export type SlackApiResponse<R = unknown> =
  | {
      ok: false;
      error: string;
    }
  | ({
      ok: true;
    } & R);
