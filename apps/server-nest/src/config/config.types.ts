export type ServerConfig = {
  port: number;
};

export type ExperimentsConfig = {
  backupPrivateMessages: boolean;
};

export type SlackConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  teamId: string;
  oauthRedirectUri: string;
};

export enum Env {
  dev = 'dev',
  prod = 'prod',
}
