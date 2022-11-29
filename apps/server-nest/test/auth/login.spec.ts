import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from 'src/config/config.service';
import { createMockConfigService, MockConfig } from 'test/mock/config';
import { TokenService } from 'src/auth/token/token.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import {
  InvalidVerificationCodeError,
  SpentVerificationCodeError,
} from 'src/auth/auth.errors';
import { SlackApiError } from 'src/slack/slack.errors';
import { Logger } from 'src/common/logger/logger';

describe('Login', () => {
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
        { provide: SlackApiProvider, useValue: { exchangeCode: jest.fn() } },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
  });

  it('should login successfully', async () => {
    const verificationCode = 'XYZ';
    const userId = 'U1234';
    const accessToken = 'ABC';

    jest.mocked(slackApiProvider.exchangeCode).mockResolvedValueOnce({
      ok: true,
      access_token: accessToken,
      user_id: userId,
    });

    const token = await service.login(verificationCode);
    const decodedToken = await tokenService.verify(token);

    expect(slackApiProvider.exchangeCode).toHaveBeenCalledWith({
      code: verificationCode,
      redirect_uri: mockConfigService.slack.oauthRedirectUri,
    });

    expect(decodedToken).toEqual(
      expect.objectContaining({
        userId,
        accessToken,
      }),
    );

    expect((decodedToken.exp || 0) - (decodedToken.iat || 0)).toEqual(
      30 * 24 * 60 * 60,
    );
  });

  describe('Slack error handling', () => {
    const userErrorCodes = [
      { code: 'invalid_code', expectedError: InvalidVerificationCodeError },
      { code: 'code_already_used', expectedError: SpentVerificationCodeError },
    ];

    for (const error of userErrorCodes) {
      it(`should handle ${error.code} error`, async () => {
        const verificationCode = 'XYZ';

        jest.mocked(slackApiProvider.exchangeCode).mockResolvedValueOnce({
          ok: false,
          error: error.code,
        });

        await expect(service.login(verificationCode)).rejects.toBeInstanceOf(
          error.expectedError,
        );
      });
    }

    it('should handle other unknown slack error codes', async () => {
      const errorCode = 'some_unknown_slack_error';
      const verificationCode = 'XYZ';

      jest.mocked(slackApiProvider.exchangeCode).mockResolvedValueOnce({
        ok: false,
        error: errorCode,
      });

      await expect(service.login(verificationCode)).rejects.toEqual(
        new SlackApiError(errorCode),
      );
    });
  });
});
