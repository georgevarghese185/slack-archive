import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

const env = {
  SLACK_BASE_URL: 'https://slack.com',
  SLACK_CLIENT_ID: '1234',
  SLACK_TEAM_ID: 'T1234',
  OAUTH_REDIRECT_URI: 'http://slack-archive/authorize',
};

describe('Get Auth URL (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    Object.assign(process.env, env);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v1/login/auth-url (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/login/auth-url')
      .expect(200)
      .expect({
        url: env.SLACK_BASE_URL + '/oauth/authorize',
        parameters: {
          client_id: env.SLACK_CLIENT_ID,
          team: env.SLACK_TEAM_ID,
          scope: 'channels:history,channels:read,users:read',
          redirect_uri: env.OAUTH_REDIRECT_URI,
        },
      });
  });
});
