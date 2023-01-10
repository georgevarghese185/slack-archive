import { Injectable } from '@nestjs/common';
import { MemberService } from 'src/member/member.service';
import { Member } from 'src/slack';
import { SlackApiProvider } from 'src/slack/slack-api.provider';
import { BackupCancellationService } from './backup-cancellation.service';

@Injectable()
export class MemberBackupService {
  constructor(
    private slackApiProvider: SlackApiProvider,
    private memberService: MemberService,
    private cancelService: BackupCancellationService,
  ) {}

  async backup(
    backupId: string,
    accessToken: string,
    cursor?: string,
  ): Promise<void> {
    await this.cancelService.checkCancellation(backupId);

    const response = await this.getMembers(accessToken, cursor);

    if (!response.ok) {
      throw new Error('Not Implemented');
    }

    const members = response.members;
    const nextCursor = response.response_metadata?.next_cursor;

    await this.saveMembers(members);

    if (nextCursor) {
      return this.backup(backupId, accessToken, nextCursor);
    }
  }

  private async getMembers(token: string, cursor?: string) {
    return cursor
      ? await this.slackApiProvider.getMembers({ cursor, token })
      : await this.slackApiProvider.getMembers({ token });
  }

  private async saveMembers(members: Member[]) {
    if (!members.length) {
      return;
    }

    await this.memberService.add(
      members.map((member) => ({
        id: member.id,
        name: member.name,
        json: member,
      })),
    );
  }
}
