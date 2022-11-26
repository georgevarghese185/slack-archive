import { Test, TestingModule } from '@nestjs/testing';
import type { AuthUrl } from 'src/auth';
import { AuthService } from 'src/auth/auth.service';
import { TokenService } from 'src/auth/token/token.service';
import { Logger } from 'src/common/logger/logger';
import { ConfigService } from 'src/config/config.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { createMockConfigService, MockConfig } from 'test/mock/config';

describe('Get Auth URL', () => {
  let service: AuthService;
  let mockConfigService: MockConfig;

  beforeEach(async () => {
    mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        SlackApiProvider,
        TokenService,
        Logger,
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
