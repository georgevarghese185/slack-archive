export type ExchangeCodeRequest = {
  code: string;
  redirect_uri: string;
};

export type ExchangeCodeResponse = {
  access_token: string;
  user_id: string;
};

export type SlackApiResponse<R> =
  | {
      ok: false;
      error: string;
    }
  | ({
      ok: true;
    } & R);
