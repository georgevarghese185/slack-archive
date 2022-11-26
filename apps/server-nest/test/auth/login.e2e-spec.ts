import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getVerificationCode } from './login.util';
import { createTestApp } from 'test/test-app.module';

describe('Login (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
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
});
