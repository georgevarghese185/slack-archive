import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from 'src/config/config.service';
import { createMockConfigService, MockConfig } from 'test/mock/config';
import { TokenService } from 'src/auth/token/token.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { Logger } from 'src/common/logger/logger';

describe('Logout', () => {
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
        { provide: SlackApiProvider, useValue: { revokeAuth: jest.fn() } },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    slackApiProvider = module.get<SlackApiProvider>(SlackApiProvider);
  });

  it('should revoke slack token on logout', async () => {
    const userId = 'U1234';
    const accessToken = 'ABC';
    const token = await tokenService.sign({ userId, accessToken });

    jest.mocked(slackApiProvider.revokeAuth).mockResolvedValueOnce({
      ok: true,
    });

    await service.logout(token);

    expect(slackApiProvider.revokeAuth).toHaveBeenCalledWith({
      token: accessToken,
    });
  });

  it('should logout successfully even if slack token revocation fails', async () => {
    const userId = 'U1234';
    const accessToken = 'ABC';
    const token = await tokenService.sign({ userId, accessToken });

    jest
      .mocked(slackApiProvider.revokeAuth)
      .mockRejectedValueOnce(new Error('failed to revoke token'));

    await service.logout(token);

    expect(slackApiProvider.revokeAuth).toHaveBeenCalledWith({
      token: accessToken,
    });
  });
});
