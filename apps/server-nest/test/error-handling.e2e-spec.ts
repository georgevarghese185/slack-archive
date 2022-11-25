import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-app.module';

describe('Error Handling (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it('should handle slack API errors', async () => {
    return request(app.getHttpServer())
      .post('/v1/login')
      .send({ verificationCode: 'mock-slack.error.return:fake_error_code' })
      .expect(502)
      .expect({
        errorCode: 'slack_error',
        message: 'Received error from Slack: fake_error_code',
      });
  });
});
