import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { login } from 'test/auth/auth.util';
import { createTestApp } from 'test/test-app.module';

describe('Backup (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  describe('/v1/backups/stats', () => {
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
    it('should not allow unauthenticated call', async () => {
      return request(app.getHttpServer())
        .get('/v1/backups/running')
        .expect(401);
    });
  });
  describe('Backup', () => {
    let cookie: string;

    beforeAll(async () => {
      const loginResponse = await login(app);
      cookie = loginResponse.cookie;
    });

    it('should not have any running backups', async () => {
      return request(app.getHttpServer())
        .get('/v1/backups/running')
        .set('cookie', cookie)
        .expect(200)
        .expect({
          running: [],
        });
    });
  });
});
