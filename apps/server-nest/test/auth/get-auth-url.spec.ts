import { Test, TestingModule } from '@nestjs/testing';
import { AuthUrl } from 'src/auth';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from 'src/config/config.service';
import { SlackConfig, ExperimentsConfig } from 'src/config';

const createMockConfigService = () => {
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
  } as ConfigService;
};

describe('Get Auth URL', () => {
  let service: AuthService;
  let mockConfigService: ConfigService;

  beforeEach(async () => {
    mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should get auth URL with parameters', async () => {
    expect(service.getAuthUrl()).toEqual({
      url: mockConfigService.slack.baseUrl + '/oauth/authorize',
      parameters: {
        client_id: mockConfigService.slack.clientId,
        scope: 'channels:history,channels:read,users:read',
        redirect_uri: mockConfigService.slack.oauthRedirectUri,
        team: mockConfigService.slack.teamId,
      },
    } as AuthUrl);
  });

  it('should return OAuth scope for private messages when experiment is enabled', async () => {
    mockConfigService.experiments.backupPrivateMessages = true;

    expect(service.getAuthUrl()).toEqual({
      url: mockConfigService.slack.baseUrl + '/oauth/authorize',
      parameters: {
        client_id: mockConfigService.slack.clientId,
        scope:
          'channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read',
        redirect_uri: mockConfigService.slack.oauthRedirectUri,
        team: mockConfigService.slack.teamId,
      },
    } as AuthUrl);
  });
});
