import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BackupStatus } from 'src/backup';
import BackupEntity from 'src/backup/backup.entity';
import request from 'supertest';
import { In, Not } from 'typeorm';

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

export const stopAllBackups = async (app: INestApplication) => {
  const backupRepository = app.get(getRepositoryToken(BackupEntity));
  await backupRepository.update(
    {
      status: Not(
        In([
          BackupStatus.Cancelled,
          BackupStatus.Completed,
          BackupStatus.Failed,
        ]),
      ),
    },
    { status: BackupStatus.Failed, error: 'Stopping test backup' },
  );
};
