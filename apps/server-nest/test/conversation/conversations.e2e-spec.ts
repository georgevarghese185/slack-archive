import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { login } from 'test/auth/auth.util';
import { createTestApp } from 'test/test-app.module';
import axios from 'axios';
import { runBackup } from 'test/backup/backup.util';
import { ConversationsResponse } from 'src/slack';

describe('Conversations (e2e)', () => {
  let cookie: string;
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
    const loginResponse = await login(app);
    cookie = loginResponse.cookie;
    await runBackup(app, cookie);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/conversations (GET)', () => {
    it('should list conversations', async () => {
      const { data } = await axios.get<ConversationsResponse>(
        `${process.env['SLACK_BASE_URL']}/api/conversations.list`,
        {
          params: { limit: 1000000 },
          headers: { authorization: `Bearer bypass` },
        },
      );

      const response = await request(app.getHttpServer())
        .get('/v1/conversations')
        .set('cookie', cookie)
        .expect(200);

      expect(response.body.conversations).toEqual(
        data.channels.map(({ id, name }) => ({ id, name })),
      );
    });
  });
});
