import { Injectable } from '@nestjs/common';
import { BackupStatus } from '..';
import { BackupCancelledError } from '../backup.errors';
import { BackupRepository } from '../backup.repository';

@Injectable()
export class BackupCancellationService {
  constructor(private backupRepository: BackupRepository) {}

  /**
   * Checks if a backup has been requested to be cancelled. If so, an error will be thrown.
   * Use this function to halt the execution of a backup
   *
   * @param backupId Backup id
   */
  async checkCancellation(backupId: string) {
    if (await this.backupRepository.shouldCancel(backupId)) {
      throw new BackupCancelledError();
    }
  }

  async cancelBackup(backupId: string) {
    await this.backupRepository.update(backupId, {
      status: BackupStatus.Cancelled,
    });
  }
}
