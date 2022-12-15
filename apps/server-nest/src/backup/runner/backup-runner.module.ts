import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/common/logger/logger.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { SlackModule } from 'src/slack/slack.module';
import BackupEntity from '../backup.entity';
import { BackupRepository } from '../backup.repository';
import { BackupCancellationService } from './backup-cancellation.service';
import { BackupRunnerService } from './backup-runner.service';
import { ConversationBackupService } from './conversation-backup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BackupEntity]),
    SlackModule,
    ConversationModule,
    LoggerModule,
  ],
  providers: [
    BackupRepository,
    BackupRunnerService,
    BackupCancellationService,
    ConversationBackupService,
  ],
})
export class BackupRunnerModule {}
