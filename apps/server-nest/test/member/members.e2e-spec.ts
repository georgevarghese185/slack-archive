import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { login } from 'test/auth/auth.util';
import { createTestApp } from 'test/test-app.module';
import axios from 'axios';
import { runBackup } from 'test/backup/backup.util';
import { Member, MembersResponse } from 'src/slack';

const getSlackMembers = async (): Promise<Member[]> => {
  const { data } = await axios.get<MembersResponse>(
    `${process.env['SLACK_BASE_URL']}/api/users.list`,
    {
      params: { limit: 1000000 },
      headers: { authorization: `Bearer bypass` },
    },
  );

  return data.members;
};

describe('Members (e2e)', () => {
  let cookie: string;
  let app: INestApplication;
  let members: Member[];

  beforeAll(async () => {
    app = await createTestApp();
    const loginResponse = await login(app);
    cookie = loginResponse.cookie;
    members = await getSlackMembers();
    await runBackup(app, cookie);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/members (GET)', () => {
    it('should list members', async () => {
      return request(app.getHttpServer())
        .get('/v1/members')
        .set('cookie', cookie)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({
            members: expect.arrayContaining(
              members.map(({ id, profile }) => ({
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
            ),
          });
        });
    });

    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).get('/v1/members').expect(401);
    });
  });

  describe('/v1/members/:id (GET)', () => {
    it('should get member by id', async () => {
      const member = members[0];

      if (!member) {
        throw new Error('no members?');
      }

      return request(app.getHttpServer())
        .get(`/v1/members/${member.id}`)
        .set('cookie', cookie)
        .expect(200)
        .expect({
          id: member.id,
          profile: {
            display_name: member.profile.display_name,
            image_24: member.profile.image_24,
            image_32: member.profile.image_32,
            image_48: member.profile.image_48,
            image_72: member.profile.image_72,
            image_192: member.profile.image_192,
            image_512: member.profile.image_512,
            image_1024: member.profile.image_1024,
          },
        });
    });

    it('should return 404 for invalid id', async () => {
      return request(app.getHttpServer())
        .get(`/v1/members/0000`)
        .set('cookie', cookie)
        .expect(404)
        .expect((response) => {
          expect(response.body.errorCode).toEqual('member_not_found');
        });
    });

    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).get('/v1/members/0000').expect(401);
    });
  });
});
