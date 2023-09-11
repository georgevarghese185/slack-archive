import { Injectable } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageService } from 'src/message/message.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { BackupStatus } from '../backup.types';
import { Conversation } from 'src/conversation';
import { Message } from 'src/slack';
import { BackupService } from '../backup.service';
import { isBroadcast, isReply } from 'src/message';

@Injectable()
export class MessageBackupService {
  constructor(
    private conversationService: ConversationService,
    private slackApiProvider: SlackApiProvider,
    private messageService: MessageService,
    private backupService: BackupService,
  ) {}

  async backup(backupId: string, accessToken: string): Promise<void> {
    await this.backupService.setStatus(backupId, BackupStatus.BackingUp);

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

      await this.backupService.setBackedUpMessages(backupId, backedUp);
      await this.backupService.setBackedUpConversations(
        backupId,
        backedUpConversations,
      );
    }
  }

  private async backupConversation(
    backupId: string,
    accessToken: string,
    conversation: Conversation,
  ): Promise<number> {
    await this.backupService.setCurrentConversation(backupId, conversation);
    let count = 0;

    const response = await this.slackApiProvider.getConversationHistory({
      token: accessToken,
      conversationId: conversation.id,
    });

    if (!response.ok) {
      throw new Error('Not implemented');
    }

    const messages = response.messages;

    await this.addMessages(conversation, messages);

    count += messages.length;

    for (const message of messages) {
      if (message.thread_ts === message.ts) {
        const repliesBackedUp = await this.backupThread(
          accessToken,
          conversation,
          message.thread_ts,
        );

        count += repliesBackedUp;
      }
    }

    return count;
  }

  private async backupThread(
    accessToken: string,
    conversation: Conversation,
    threadTs: string,
  ) {
    const response = await this.slackApiProvider.getConversationReplies({
      token: accessToken,
      conversationId: conversation.id,
      threadTs,
    });

    if (!response.ok) {
      throw new Error('Not implemented');
    }

    const messages = response.messages;

    await this.addMessages(conversation, messages);

    const replyCount = messages.filter(
      (m) => isReply(m) && !isBroadcast(m),
    ).length;

    return replyCount;
  }

  private async addMessages(conversation: Conversation, messages: Message[]) {
    await this.messageService.add(
      messages.map((message) => ({
        conversationId: conversation.id,
        ts: message.ts,
        json: message,
        ...(message.subtype ? { subtype: message.subtype } : {}),
        ...(message.thread_ts ? { threadTs: message.thread_ts } : {}),
      })),
    );
  }
}
