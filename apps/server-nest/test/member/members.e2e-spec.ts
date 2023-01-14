import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { login } from 'test/auth/auth.util';
import { createTestApp } from 'test/test-app.module';
import axios from 'axios';
import { runBackup } from 'test/backup/backup.util';
import { MembersResponse } from 'src/slack';

describe('Members (e2e)', () => {
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

  describe('/v1/members (GET)', () => {
    it('should list members', async () => {
      const { data } = await axios.get<MembersResponse>(
        `${process.env['SLACK_BASE_URL']}/api/users.list`,
        {
          params: { limit: 1000000 },
          headers: { authorization: `Bearer bypass` },
        },
      );

      const response = await request(app.getHttpServer())
        .get('/v1/members')
        .set('cookie', cookie)
        .expect(200);

      expect(response.body.members).toEqual(
        data.members.map(({ id, profile }) => ({
          id,
          profile: {
            display_name: profile.display_name,
            image_24: profile.image_24,
            image_32: profile.image_32,
            image_48: profile.image_48,
            image_72: profile.image_72,
            image_192: profile.image_192,
            image_512: profile.image_512,
            image_1024: profile.image_1024,
          },
        })),
      );
    });
  });
});
