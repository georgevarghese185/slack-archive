import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageService } from 'src/message/message.service';
import { BackupEventPayload } from '.';
import { BackupInProgressError, BackupNotFoundError } from './backup.errors';
import { BackupRepository } from './backup.repository';
import { BackupStats, BackupStatus } from './backup.types';
import { BackupDto } from './dto';

@Injectable()
export class BackupService {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private backupRepository: BackupRepository,
    private eventEmitter: EventEmitter2,
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

  async createBackup(
    createdBy: string,
    accessToken: string,
  ): Promise<BackupDto> {
    const activeBackup = await this.backupRepository.getActive();

    if (activeBackup) {
      throw new BackupInProgressError();
    }

    const backup = await this.backupRepository.save({
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

    this.eventEmitter.emit('backup.created', {
      backupId: backup.id,
      accessToken,
    } as BackupEventPayload);

    return BackupDto.fromBackup(backup);
  }

  async getRunning(): Promise<BackupDto | null> {
    const backup = await this.backupRepository.getActive();

    if (!backup) {
      return null;
    }

    return BackupDto.fromBackup(backup);
  }

  async get(id: string): Promise<BackupDto> {
    const backup = await this.backupRepository.findById(id);

    if (!backup) {
      throw new BackupNotFoundError();
    }

    return BackupDto.fromBackup(backup);
  }
}
