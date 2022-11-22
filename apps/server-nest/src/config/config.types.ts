export type ServerConfig = {
  port: number;
};

export type ExperimentsConfig = {
  backupPrivateMessages: boolean;
};

export type SlackConfig = {
  baseUrl: string;
  clientId: string;
  teamId: string;
  oauthRedirectUri: string;
};
