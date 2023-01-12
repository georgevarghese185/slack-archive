import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const startBackup = async (app: INestApplication, cookie: string) => {
  const response = await request(app.getHttpServer())
    .post('/v1/backups/new')
    .set('cookie', cookie);

  expect(response.statusCode).toEqual(201);

  return response.body.backupId;
};

export const runBackup = async (
  app: INestApplication,
  cookie: string,
): Promise<string> => {
  const backupId = await startBackup(app, cookie);
  let backupStatusResponse;

  for (let i = 0; i < 4; i++) {
    backupStatusResponse = await request(app.getHttpServer())
      .get(`/v1/backups/${backupId}`)
      .set('cookie', cookie);

    if (backupStatusResponse.body.status === 'COMPLETED') {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  expect(backupStatusResponse?.body.status).toEqual('COMPLETED');

  return backupId;
};
