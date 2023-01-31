import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BackupCancelledError } from '../backup.errors';
import { ConversationBackupService } from './conversation-backup.service';
import { BackupEventPayload } from '../backup.types';
import { Logger } from 'src/common/logger/logger';
import { MemberBackupService } from './member-backup.service';
import { MessageBackupService } from './message-backup.service';
import { BackupService } from '../backup.service';

@Injectable()
export class BackupRunnerService {
  constructor(
    private conversationBackupService: ConversationBackupService,
    private memberBackupService: MemberBackupService,
    private messageBackupService: MessageBackupService,
    private backupService: BackupService,
    private logger: Logger,
  ) {}

  @OnEvent('backup.created')
  async onBackupCreatedEvent({ backupId, accessToken }: BackupEventPayload) {
    void this.runBackup(backupId, accessToken);
  }

  async runBackup(backupId: string, accessToken: string): Promise<void> {
    try {
      await this.conversationBackupService.backup(backupId, accessToken);
      await this.memberBackupService.backup(backupId, accessToken);
      await this.messageBackupService.backup(backupId, accessToken);
      await this.backupService.complete(backupId);
    } catch (e) {
      if (e instanceof BackupCancelledError) {
        return this.backupService.cancel(backupId);
      }

      this.logger.error('Backup error', e);

      await this.backupService.fail(
        backupId,
        e instanceof Error ? e.message : `Unknown error ${e}`,
      );
    }
  }
}
