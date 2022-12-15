import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BackupCancellationService } from './backup-cancellation.service';
import { BackupCancelledError } from '../backup.errors';
import { ConversationBackupService } from './conversation-backup.service';
import { BackupRepository } from '../backup.repository';
import { BackupEventPayload, BackupStatus } from '..';
import { Logger } from 'src/common/logger/logger';

@Injectable()
export class BackupRunnerService {
  constructor(
    private conversationBackupService: ConversationBackupService,
    private cancelService: BackupCancellationService,
    private backupRepository: BackupRepository,
    private logger: Logger,
  ) {}

  @OnEvent('backup.created')
  async onBackupCreatedEvent({ backupId, accessToken }: BackupEventPayload) {
    void this.runBackup(backupId, accessToken);
  }

  async runBackup(backupId: string, accessToken: string): Promise<void> {
    try {
      await this.conversationBackupService.backup(backupId, accessToken);
      await this.completeBackup(backupId);
    } catch (e) {
      if (e instanceof BackupCancelledError) {
        return this.cancelService.cancelBackup(backupId);
      }

      this.logger.error('Backup error', e);

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
