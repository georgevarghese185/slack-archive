import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import BackupEntity from 'src/backup/backup.entity';
import { BackupStatus } from 'src/backup/backup.types';
import request from 'supertest';
import { login } from 'test/auth/auth.util';
import { createTestApp } from 'test/test-app.module';
import { Repository } from 'typeorm';

describe('Backup (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  describe('/v1/backups/stats', () => {
    it('should get stats', async () => {
      const { cookie } = await login(app);

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

  describe('/v1/backups/:id', () => {
    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).get('/v1/backups/1234').expect(401);
    });
  });

  describe('/v1/backups/new', () => {
    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer()).post('/v1/backups/new').expect(401);
    });
  });

  describe('/v1/backups/running', () => {
    it('should not have any running backups', async () => {
      const { cookie } = await login(app);

      return request(app.getHttpServer())
        .get('/v1/backups/running')
        .set('cookie', cookie)
        .expect(200)
        .expect({
          running: [],
        });
    });

    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer())
        .get('/v1/backups/running')
        .expect(401);
    });
  });

  describe('Backup', () => {
    let cookie: string;
    let backupId: string;
    let backupRepository: Repository<BackupEntity>;

    beforeAll(async () => {
      const loginResponse = await login(app);
      cookie = loginResponse.cookie;
      backupRepository = app.get(getRepositoryToken(BackupEntity));
    });

    afterAll(async () => {
      await backupRepository.update(
        { id: backupId },
        { status: BackupStatus.Failed, error: 'Stopping test backup' },
      );
    });

    it('should start a new backup', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/backups/new')
        .set('cookie', cookie);

      backupId = response.body.backupId;

      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        backupId: expect.any(String),
      });
    });

    it('should return running backup', async () => {
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

    it('should not start a parallel backup', async () => {
      return await request(app.getHttpServer())
        .post('/v1/backups/new')
        .set('cookie', cookie)
        .expect(409);
    });

    it('should get backup by id', async () => {
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
});
