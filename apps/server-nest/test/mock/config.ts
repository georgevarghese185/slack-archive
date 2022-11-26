import type { ExperimentsConfig, SlackConfig } from 'src/config';
import type { ConfigService } from 'src/config/config.service';

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
  } as ConfigService;
};
