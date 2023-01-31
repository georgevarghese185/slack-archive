import { forwardRef, Module } from '@nestjs/common';
import { LoggerModule } from 'src/common/logger/logger.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { MemberModule } from 'src/member/member.module';
import { MessageModule } from 'src/message/message.module';
import { SlackModule } from 'src/slack/slack.module';
import { BackupModule } from '../backup.module';
import { BackupRunnerService } from './backup-runner.service';
import { ConversationBackupService } from './conversation-backup.service';
import { MemberBackupService } from './member-backup.service';
import { MessageBackupService } from './message-backup.service';

@Module({
  imports: [
    forwardRef(() => BackupModule),
    SlackModule,
    ConversationModule,
    MemberModule,
    MessageModule,
    LoggerModule,
  ],
  providers: [
    BackupRunnerService,
    ConversationBackupService,
    MemberBackupService,
    MessageBackupService,
  ],
})
export class BackupRunnerModule {}
