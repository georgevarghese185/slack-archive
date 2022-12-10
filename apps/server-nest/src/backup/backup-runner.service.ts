import { Injectable } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { SlackApiProvider } from 'src/slack/slack-api.provider';

@Injectable()
export class BackupRunnerService {
  constructor(
    private slackApiProvider: SlackApiProvider,
    private conversationService: ConversationService,
  ) {}

  async runBackup(_backupId: string): Promise<void> {
    await this.backupConversations();
  }

  private async backupConversations() {
    const response = await this.slackApiProvider.getConversations();

    if (!response.ok) {
      throw new Error('Not Implemented');
    }

    await this.conversationService.add(
      response.channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        json: channel,
      })),
    );
  }
}
