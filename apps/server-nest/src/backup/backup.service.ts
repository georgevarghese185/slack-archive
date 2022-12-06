import { Injectable } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageService } from 'src/message/message.service';
import { BackupInProgressError } from './backup.errors';
import { BackupRepository } from './backup.repository';
import { Backup, BackupStats, BackupStatus } from './backup.types';

@Injectable()
export class BackupService {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private backupRepository: BackupRepository,
  ) {}

  async getBackupStats(): Promise<BackupStats> {
    const [messageCount, conversationCount, lastBackup] = await Promise.all([
      await this.messageService.getCount(),
      await this.conversationService.getCount(),
      await this.backupRepository.getLast(),
    ]);

    return {
      messages: messageCount,
      conversations: conversationCount,
      lastBackupAt: lastBackup?.endedAt || null,
    };
  }

  async startBackup(createdBy: string): Promise<Backup> {
    const activeBackup = await this.backupRepository.getActive();

    if (activeBackup) {
      throw new BackupInProgressError();
    }

    return this.backupRepository.save({
      backedUpConversations: [],
      conversationErrors: [],
      createdBy,
      currentConversation: null,
      endedAt: null,
      error: null,
      messagesBackedUp: 0,
      shouldCancel: false,
      status: BackupStatus.CollectingInfo,
      startedAt: new Date(),
    });
  }
}
