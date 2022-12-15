import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from 'src/conversation/conversation.module';
import { MessageModule } from 'src/message/message.module';
import { BackupController } from './backup.controller';
import BackupEntity from './backup.entity';
import { BackupRepository } from './backup.repository';
import { BackupService } from './backup.service';
import { BackupRunnerModule } from './runner/backup-runner.module';

@Module({
  imports: [
    BackupRunnerModule,
    MessageModule,
    ConversationModule,
    TypeOrmModule.forFeature([BackupEntity]),
  ],
  controllers: [BackupController],
  providers: [BackupService, BackupRepository],
})
export class BackupModule {}
