export type AuthUrl = {
  url: string;
  parameters: Record<string, string>;
};

export type TokenPayload = {
  userId: string;
  accessToken: string;
};
