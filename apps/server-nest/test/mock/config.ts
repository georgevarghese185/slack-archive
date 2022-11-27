import { ExperimentsConfig, SlackConfig } from 'src/config';

export type MockConfig = ReturnType<typeof createMockConfigService>;

export const createMockConfigService = () => {
  return {
    experiments: {
      backupPrivateMessages: false,
    } as ExperimentsConfig,

    slack: {
      baseUrl: 'https://slack.com',
      clientId: '1234',
      teamId: 'T1234',
      oauthRedirectUri: 'https://slack-archive/authorize',
    } as SlackConfig,

    tokenSecret: 'secret',
    tokenExpiry: '30 days',
  };
};
