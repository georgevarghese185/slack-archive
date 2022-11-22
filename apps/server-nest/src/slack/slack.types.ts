export type SlackApiRequests = {
  '/api/oauth.access': {
    code: string;
    redirect_uri: string;
  };
};

export type SlackApiResponses = {
  '/api/oauth.access': {
    access_token: string;
    user_id: string;
  };
};

export type SlackApiResponse<R> =
  | {
      ok: false;
      error: string;
    }
  | ({
      ok: true;
    } & R);
