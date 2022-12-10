import { Injectable } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { Channel } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { BackupCancellationService } from './backup-cancellation.service';

@Injectable()
export class ConversationBackupService {
  constructor(
    private slackApiProvider: SlackApiProvider,
    private conversationService: ConversationService,
    private cancelService: BackupCancellationService,
  ) {}

  async backup(backupId: string, cursor?: string): Promise<void> {
    await this.cancelService.checkCancellation(backupId);

    const response = await this.getConversations(cursor);

    if (!response.ok) {
      throw new Error('Not Implemented');
    }

    const channels = response.channels;
    const nextCursor = response.response_metadata?.next_cursor;

    await this.saveConversations(channels);

    if (nextCursor) {
      return this.backup(backupId, nextCursor);
    }
  }

  private async getConversations(cursor?: string) {
    return cursor
      ? await this.slackApiProvider.getConversations({ cursor })
      : await this.slackApiProvider.getConversations();
  }

  private async saveConversations(channels: Channel[]) {
    await this.conversationService.add(
      channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        json: channel,
      })),
    );
  }
}
