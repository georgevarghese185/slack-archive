import { Injectable } from '@nestjs/common';
import { BackupCancellationService } from './backup-cancellation.service';
import { BackupCancelledError } from '../backup.errors';
import { ConversationBackupService } from './conversation-backup.service';

@Injectable()
export class BackupRunnerService {
  constructor(
    private conversationBackupService: ConversationBackupService,
    private cancelService: BackupCancellationService,
  ) {}

  async runBackup(backupId: string): Promise<void> {
    try {
      await this.conversationBackupService.backup(backupId);
    } catch (e) {
      if (e instanceof BackupCancelledError) {
        return this.cancelService.cancelBackup(backupId);
      }

      throw new Error('Error handling not implemented');
    }
  }
}
