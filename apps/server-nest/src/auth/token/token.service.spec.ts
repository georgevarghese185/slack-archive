import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'src/config/config.service';
import { createMockConfigService } from 'test/mock/config';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  const mockConfigService = createMockConfigService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should sign and verify a token', async () => {
    const payload = { accessToken: 'token', userId: 'U1234' };

    const token = await service.sign(payload);
    const decodedToken = await service.verify(token);

    expect(decodedToken).toEqual(expect.objectContaining(payload));
  });
});
