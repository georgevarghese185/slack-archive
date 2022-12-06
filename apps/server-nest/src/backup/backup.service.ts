import { Injectable } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageService } from 'src/message/message.service';
import { BackupRepository } from './backup.repository';
import { BackupStats } from './backup.types';

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
}
