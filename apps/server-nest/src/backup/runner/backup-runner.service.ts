import { Injectable } from '@nestjs/common';
import { BackupCancellationService } from './backup-cancellation.service';
import { BackupCancelledError } from '../backup.errors';
import { ConversationBackupService } from './conversation-backup.service';
import { BackupRepository } from '../backup.repository';
import { BackupStatus } from '..';

@Injectable()
export class BackupRunnerService {
  constructor(
    private conversationBackupService: ConversationBackupService,
    private cancelService: BackupCancellationService,
    private backupRepository: BackupRepository,
  ) {}

  async runBackup(backupId: string): Promise<void> {
    try {
      await this.conversationBackupService.backup(backupId);
      await this.completeBackup(backupId);
    } catch (e) {
      if (e instanceof BackupCancelledError) {
        return this.cancelService.cancelBackup(backupId);
      }

      throw new Error('Error handling not implemented');
    }
  }

  async completeBackup(backupId: string) {
    await this.backupRepository.update(backupId, {
      status: BackupStatus.Completed,
      endedAt: new Date(),
    });
  }
}
