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

  async backup(
    backupId: string,
    accessToken: string,
    cursor?: string,
  ): Promise<void> {
    await this.cancelService.checkCancellation(backupId);

    const response = await this.getConversations(accessToken, cursor);

    if (!response.ok) {
      throw new Error('Not Implemented');
    }

    const channels = response.channels;
    const nextCursor = response.response_metadata?.next_cursor;

    await this.saveConversations(channels);

    if (nextCursor) {
      return this.backup(backupId, accessToken, nextCursor);
    }
  }

  private async getConversations(token: string, cursor?: string) {
    return cursor
      ? await this.slackApiProvider.getConversations({ cursor, token })
      : await this.slackApiProvider.getConversations({ token });
  }

  private async saveConversations(channels: Channel[]) {
    if (!channels.length) {
      return;
    }

    await this.conversationService.add(
      channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        json: channel,
      })),
    );
  }
}
