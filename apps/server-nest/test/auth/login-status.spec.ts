import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from 'src/config/config.service';
import { createMockConfigService, MockConfig } from 'test/mock/config';
import { TokenService } from 'src/auth/token/token.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { Logger } from 'src/common/logger/logger';
import {
  ExpiredTokenError,
  InvalidTokenError,
  TokenParseError,
} from 'src/auth/token/token.errors';
import { SlackApiError } from 'src/slack/slack.errors';

describe('Login status', () => {
  let service: AuthService;
  let mockConfigService: MockConfig;
  let tokenService: TokenService;
  let slackApiProvider: SlackApiProvider;

  beforeEach(async () => {
    mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenService,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: SlackApiProvider,
          useValue: { testAuth: jest.fn(), revokeAuth: jest.fn() },
        },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
  });

  it('should accept a valid token', async () => {
    const accessToken = 'XYZ';
    const userId = 'U1234';
    const token = await tokenService.sign({ accessToken, userId });

    jest.mocked(slackApiProvider.testAuth).mockResolvedValueOnce({ ok: true });

    await service.validateToken(token);

    expect(slackApiProvider.testAuth).toHaveBeenCalledWith({
      token: accessToken,
    });
  });

  it('should reject an invalid token', async () => {
    const invalidToken = 'not a real token';

    await expect(service.validateToken(invalidToken)).rejects.toBeInstanceOf(
      TokenParseError,
    );
  });

  it('should reject an unverified token', async () => {
    const accessToken = 'XYZ';
    const userId = 'U1234';

    // sign the token with a different secret to trigger a token verification error
    mockConfigService.tokenSecret = 'secret';
    const token = await tokenService.sign({ accessToken, userId });
    mockConfigService.tokenSecret = 'different_secret';

    await expect(service.validateToken(token)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it('should reject and revoke an expired token', async () => {
    const accessToken = 'XYZ';
    const userId = 'U1234';

    // very short expiry for testing
    mockConfigService.tokenExpiry = '1ms';

    const token = await new TokenService(
      mockConfigService as ConfigService,
    ).sign({ accessToken, userId });

    jest
      .mocked(slackApiProvider.revokeAuth)
      // even if Slack's auth.revoke api fails, the final error should be an ExpiredTokenError
      .mockRejectedValueOnce(new Error('revoke failed'));

    await expect(service.validateToken(token)).rejects.toBeInstanceOf(
      ExpiredTokenError,
    );

    expect(slackApiProvider.revokeAuth).toHaveBeenCalledWith({
      token: accessToken,
    });
  });

  describe('slack error handling', () => {
    const invalidTokenErrorCodes = [
      'invalid_auth',
      'account_inactive',
      'token_revoked',
      'no_permission',
      'missing_scope',
    ];

    for (const errorCode of invalidTokenErrorCodes) {
      it(`should throw InvalidTokenError for ${errorCode} slack error code`, async () => {
        const accessToken = 'XYZ';
        const userId = 'U1234';
        const token = await tokenService.sign({ accessToken, userId });

        jest
          .mocked(slackApiProvider.testAuth)
          .mockResolvedValueOnce({ ok: false, error: errorCode });

        await expect(service.validateToken(token)).rejects.toBeInstanceOf(
          InvalidTokenError,
        );
      });
    }

    it('should handle other slack errors', async () => {
      const accessToken = 'XYZ';
      const userId = 'U1234';
      const slackErrorCode = 'unknown_error_code';
      const token = await tokenService.sign({ accessToken, userId });

      jest
        .mocked(slackApiProvider.testAuth)
        .mockResolvedValueOnce({ ok: false, error: slackErrorCode });

      try {
        await service.validateToken(token);
        throw new Error('Should have failed');
      } catch (e) {
        expect(e).toBeInstanceOf(SlackApiError);
        expect((e as SlackApiError).code).toEqual('slack_error');
        expect((e as SlackApiError).message).toContain(slackErrorCode);
      }
    });
  });
});
