export type AuthUrl = {
  url: string;
  parameters: Record<string, string>;
};

export type LoginToken = {
  token: string;
};

export type TokenPayload = {
  userId: string;
  accessToken: string;
};
