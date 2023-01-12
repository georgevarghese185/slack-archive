import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { login } from 'test/auth/auth.util';
import { createTestApp } from 'test/test-app.module';
import { startBackup, stopAllBackups } from './backup.util';

describe('Backup (e2e)', () => {
  let app: INestApplication;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const response = await login(app);
    cookie = response.cookie;
  });

  afterEach(async () => {
    await stopAllBackups(app);
  });

  describe('/v1/backups/stats (GET)', () => {
    it('should get stats', async () => {
      return request(app.getHttpServer())
        .get('/v1/backups/stats')
        .set('cookie', cookie)
        .expect(200)
        .expect((response) =>
          expect(response.body).toMatchObject({
            messages: expect.any(Number),
            conversations: expect.any(Number),
            lastBackupAt: expect.toBeOneOf([null, expect.any(String)]),
          }),
        );
    });

    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).get('/v1/backups/stats').expect(401);
    });
  });

  describe('/v1/backups/new (POST)', () => {
    it('should start a new backup', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/backups/new')
        .set('cookie', cookie);

      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        backupId: expect.any(String),
      });
    });

    it('should not start parallel backups', async () => {
      await startBackup(app, cookie);

      return await request(app.getHttpServer())
        .post('/v1/backups/new')
        .set('cookie', cookie)
        .expect(409);
    });

    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).post('/v1/backups/new').expect(401);
    });
  });

  describe('/v1/backups/running (GET)', () => {
    it('should not have any running backups', async () => {
      return request(app.getHttpServer())
        .get('/v1/backups/running')
        .set('cookie', cookie)
        .expect(200)
        .expect({
          running: [],
        });
    });

    it('should return running backup', async () => {
      const backupId = await startBackup(app, cookie);

      return await request(app.getHttpServer())
        .get('/v1/backups/running')
        .set('cookie', cookie)
        .expect(200)
        .expect((response) =>
          expect(response.body).toEqual({
            running: [
              {
                id: backupId,
                status: expect.any(String),
                error: null,
                messagesBackedUp: expect.any(Number),
                currentConversation: expect.toBeOneOf([
                  null,
                  expect.any(String),
                ]),
                backedUpConversations: expect.toBeArray(),
              },
            ],
          }),
        );
    });

    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer())
        .get('/v1/backups/running')
        .expect(401);
    });
  });

  describe('/v1/backups/:id (GET)', () => {
    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).get('/v1/backups/1234').expect(401);
    });

    it('should get backup by id', async () => {
      const backupId = await startBackup(app, cookie);

      return await request(app.getHttpServer())
        .get(`/v1/backups/${backupId}`)
        .set('cookie', cookie)
        .expect(200)
        .expect((response) =>
          expect(response.body).toEqual({
            id: backupId,
            status: expect.any(String),
            error: null,
            messagesBackedUp: expect.any(Number),
            currentConversation: expect.toBeOneOf([null, expect.any(String)]),
            backedUpConversations: expect.toBeArray(),
          }),
        );
    });
  });

  it('should complete backup', async () => {
    const backupId = await startBackup(app, cookie);

    let response;

    for (let i = 0; i < 4; i++) {
      response = await request(app.getHttpServer())
        .get(`/v1/backups/${backupId}`)
        .set('cookie', cookie);

      if (response.body.status === 'COMPLETED') {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(response?.body.status).toEqual('COMPLETED');
  });
});
