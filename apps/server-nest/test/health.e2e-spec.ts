import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/health', async () => {
    return request(app.getHttpServer())
      .get('/v1/health')
      .expect(200)
      .expect('up');
  });
});
