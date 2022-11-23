import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from 'src/config/config.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { createMockConfigService } from 'test/mock/config';
import { TokenService } from 'src/auth/token/token.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import {
  InvalidVerificationCodeError,
  SpentVerificationCodeError,
} from 'src/auth/auth.errors';
import { SlackApiError } from 'src/slack/slack.errors';
import { Logger } from 'src/common/logger/logger';

describe('Get Auth URL', () => {
  let service: AuthService;
  let mockConfigService: ConfigService;
  let tokenService: TokenService;
  let slackApiProvider: SlackApiProvider;

  beforeEach(async () => {
    mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SlackApiProvider, useValue: { request: jest.fn() } },
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
    const loginDto = new LoginDto();
    loginDto.verificationCode = verificationCode;

    jest.mocked(slackApiProvider.request).mockResolvedValueOnce({
      ok: true,
      access_token: accessToken,
      user_id: userId,
    });

    const { token } = await service.login(loginDto);
    const decodedToken = await tokenService.verify(token);

    expect(slackApiProvider.request).toHaveBeenCalledWith('/api/oauth.access', {
      code: verificationCode,
      redirect_uri: mockConfigService.slack.oauthRedirectUri,
    });

    expect(decodedToken).toEqual(
      expect.objectContaining({
        userId,
        accessToken,
      }),
    );

    expect(decodedToken.exp - decodedToken.iat).toEqual(30 * 24 * 60 * 60);
  });

  describe('Slack error handling', () => {
    const userErrorCodes = [
      { code: 'invalid_code', expectedError: InvalidVerificationCodeError },
      { code: 'code_already_used', expectedError: SpentVerificationCodeError },
    ];

    for (const error of userErrorCodes) {
      it(`should handle ${error.code} error`, async () => {
        const loginDto = new LoginDto();
        loginDto.verificationCode = 'XYZ';

        jest.mocked(slackApiProvider.request).mockResolvedValueOnce({
          ok: false,
          error: error.code,
        });

        await expect(service.login(loginDto)).rejects.toBeInstanceOf(
          error.expectedError,
        );
      });
    }

    it('should handle other unknown slack error codes', async () => {
      const errorCode = 'some_unknown_slack_error';
      const loginDto = new LoginDto();
      loginDto.verificationCode = 'XYZ';

      jest.mocked(slackApiProvider.request).mockResolvedValueOnce({
        ok: false,
        error: errorCode,
      });

      await expect(service.login(loginDto)).rejects.toEqual(
        new SlackApiError(errorCode),
      );
    });
  });
});
