import { Injectable } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageService } from 'src/message/message.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { BackupStatus } from '../backup.types';
import { BackupRepository } from '../backup.repository';
import { Conversation } from 'src/conversation';
import { Message } from 'src/slack';

@Injectable()
export class MessageBackupService {
  constructor(
    private conversationService: ConversationService,
    private slackApiProvider: SlackApiProvider,
    private messageService: MessageService,
    private backupRepository: BackupRepository,
  ) {}

  async backup(backupId: string, accessToken: string): Promise<void> {
    await this.setStatusBackingUp(backupId);

    const conversations = await this.conversationService.list();
    let backedUp = 0;
    let backedUpConversations: Conversation[] = [];

    for (const conversation of conversations) {
      const messageCount = await this.backupConversation(
        backupId,
        accessToken,
        conversation,
      );

      backedUp += messageCount;
      backedUpConversations = [...backedUpConversations, conversation];

      await this.setBackedUpConversations(
        backupId,
        backedUpConversations,
        backedUp,
      );
    }
  }

  private async backupConversation(
    backupId: string,
    accessToken: string,
    conversation: Conversation,
  ): Promise<number> {
    await this.setCurrentConversation(backupId, conversation);

    const response = await this.slackApiProvider.getConversationHistory({
      token: accessToken,
      conversationId: conversation.id,
    });

    if (!response.ok) {
      throw new Error('Not implemented');
    }

    const messages = response.messages;

    await this.addMessages(conversation, messages);

    return messages.length;
  }

  private async setStatusBackingUp(backupId: string) {
    await this.backupRepository.update(backupId, {
      status: BackupStatus.BackingUp,
    });
  }

  private async setCurrentConversation(
    backupId: string,
    conversation: Conversation,
  ) {
    await this.backupRepository.update(backupId, {
      currentConversation: conversation.id,
    });
  }

  private async addMessages(conversation: Conversation, messages: Message[]) {
    await this.messageService.add(
      messages.map((message) => ({
        conversationId: conversation.id,
        ts: message.ts,
        json: message,
        ...(message.thread_ts ? { threadTs: message.thread_ts } : {}),
      })),
    );
  }

  private async setBackedUpConversations(
    backupId: string,
    conversations: Conversation[],
    backedUp: number,
  ) {
    await this.backupRepository.update(backupId, {
      messagesBackedUp: backedUp,
      backedUpConversations: conversations.map((c) => c.id),
    });
  }
}
