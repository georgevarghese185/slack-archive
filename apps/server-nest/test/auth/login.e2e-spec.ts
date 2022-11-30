import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getVerificationCode, isSlackTokenValid, login } from './auth.util';
import { createTestApp } from 'test/test-app.module';
import { TokenService } from 'src/auth/token/token.service';
import { ConfigService } from 'src/config/config.service';

describe('Login (e2e)', () => {
  let app: INestApplication;
  let tokenService: TokenService;
  let configService: ConfigService;

  beforeEach(async () => {
    app = await createTestApp();
    tokenService = app.get<TokenService>(TokenService);
    configService = app.get<ConfigService>(ConfigService);
  });

  it('/v1/login/auth-url (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/login/auth-url')
      .expect(200)
      .expect({
        url: process.env['SLACK_BASE_URL'] + '/oauth/authorize',
        parameters: {
          client_id: process.env['SLACK_CLIENT_ID'],
          team: process.env['SLACK_TEAM_ID'],
          scope: 'channels:history,channels:read,users:read',
          redirect_uri: process.env['OAUTH_REDIRECT_URI'],
        },
      });
  });

  describe('/v1/login (POST)', () => {
    it('should login successfully', async () => {
      const verificationCode = await getVerificationCode(app);

      return request(app.getHttpServer())
        .post('/v1/login')
        .send({ verificationCode })
        .expect(200)
        .expect((response) => {
          const cookie = response.get('Set-Cookie')[0];
          expect(cookie).toMatch(/loginToken=.+/);
          expect(cookie).toContain('HttpOnly');
          expect(cookie).toContain('Secure');
        });
    });

    it('should handle invalid code', () => {
      return request(app.getHttpServer())
        .post('/v1/login')
        .send({ verificationCode: 'incorrect-code' })
        .expect(400)
        .expect({
          errorCode: 'invalid_code',
          message: 'Invalid verification code',
        });
    });
  });

  describe('/v1/login/status (GET)', () => {
    it('should validate login status', async () => {
      const { cookie } = await login(app);

      return request(app.getHttpServer())
        .get('/v1/login/status')
        .set('cookie', cookie)
        .expect(200);
    });

    it('should return 401 when token is missing', async () => {
      return request(app.getHttpServer())
        .get('/v1/login/status')
        .expect(401)
        .expect({
          errorCode: 'unauthorized',
          message: 'Missing "loginToken" cookie',
        });
    });

    it('should return 401 for invalid slack token', async () => {
      const { cookie, token } = await login(app);
      const invalidToken = await tokenService.sign({
        userId: 'U1234',
        accessToken: 'invalid slack token',
      });

      return request(app.getHttpServer())
        .get('/v1/login/status')
        .set(
          'cookie',
          cookie.replace(
            encodeURIComponent(token),
            encodeURIComponent(invalidToken),
          ),
        )
        .expect(401)
        .expect({
          errorCode: 'unauthorized',
          message: 'Invalid token',
        });
    });

    it('should return 401 for an expired token and revoke the slack token', async () => {
      const { cookie, token } = await login(app);
      const { accessToken, userId } = await tokenService.verify(token);
      // token with very short expiry. Should be expired by the time the request is made
      const expiredToken = await tokenService.sign(
        { accessToken, userId },
        '1ms',
      );

      await request(app.getHttpServer())
        .get('/v1/login/status')
        .set(
          'cookie',
          cookie.replace(
            encodeURIComponent(token),
            encodeURIComponent(expiredToken),
          ),
        )
        .expect(401)
        .expect({
          errorCode: 'token_expired',
          message: 'Login token expired',
        });

      // make sure the slack token has been revoked
      const isRevoked = await isSlackTokenValid(
        configService.slack.baseUrl,
        accessToken,
      );

      expect(isRevoked).toEqual(false);
    });
  });

  it('/v1/login (DELETE)', async () => {
    const { cookie, token } = await login(app);
    const { accessToken } = await tokenService.verify(token);

    await request(app.getHttpServer())
      .delete('/v1/login')
      .set('cookie', cookie)
      .expect(200)
      .expect((response) =>
        expect(response.get('Set-Cookie')[0]).toMatch(/loginToken=;/),
      );

    const isRevoked = await isSlackTokenValid(
      configService.slack.baseUrl,
      accessToken,
    );

    expect(isRevoked).toEqual(false);
  });
});
