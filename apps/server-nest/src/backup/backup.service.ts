import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation } from 'src/conversation';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageService } from 'src/message/message.service';
import { BackupEventPayload } from '.';
import {
  BackupCancelledError,
  BackupInProgressError,
  BackupNotFoundError,
} from './backup.errors';
import { BackupRepository } from './backup.repository';
import { Backup, BackupStats, BackupStatus } from './backup.types';

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

  async createBackup(createdBy: string, accessToken: string): Promise<Backup> {
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

    return backup;
  }

  getRunning(): Promise<Backup | null> {
    return this.backupRepository.getActive();
  }

  async get(id: string): Promise<Backup> {
    const backup = await this.backupRepository.findById(id);

    if (!backup) {
      throw new BackupNotFoundError();
    }

    return backup;
  }

  async setStatus(backupId: string, status: BackupStatus) {
    await this.backupRepository.update(backupId, { status });
  }

  async setCurrentConversation(backupId: string, conversation: Conversation) {
    await this.backupRepository.update(backupId, {
      currentConversation: conversation.id,
    });
  }

  async setBackedUpMessages(backupId: string, backedUp: number) {
    await this.backupRepository.update(backupId, {
      messagesBackedUp: backedUp,
    });
  }

  async setBackedUpConversations(
    backupId: string,
    conversations: Conversation[],
  ) {
    await this.backupRepository.update(backupId, {
      backedUpConversations: conversations.map((c) => c.id),
    });
  }

  /**
   * Checks if a backup has been requested to be cancelled. If so, an error will be thrown.
   * Use this function to halt the execution of a backup
   */
  async checkCancellation(backupId: string) {
    if (await this.backupRepository.shouldCancel(backupId)) {
      throw new BackupCancelledError();
    }
  }

  async cancel(backupId: string) {
    await this.backupRepository.update(backupId, {
      status: BackupStatus.Cancelled,
    });
  }

  async fail(backupId: string, message: string) {
    await this.backupRepository.update(backupId, {
      status: BackupStatus.Failed,
      error: message,
    });
  }

  async complete(backupId: string) {
    await this.backupRepository.update(backupId, {
      status: BackupStatus.Completed,
      endedAt: new Date(),
    });
  }
}
