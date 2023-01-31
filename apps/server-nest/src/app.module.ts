import { INestApplication, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DefaultExceptionFilter } from './common/error';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './config/config.module';
import { SlackModule } from './slack/slack.module';
import { DatabaseModule } from './database/database.module';
import { BackupModule } from './backup/backup.module';
import { MessageModule } from './message/message.module';
import { ConversationModule } from './conversation/conversation.module';
import cookieParser from 'cookie-parser';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AuthModule,
    ConfigModule,
    SlackModule,
    LoggerModule,
    DatabaseModule,
    BackupModule,
    MessageModule,
    ConversationModule,
    MemberModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DefaultExceptionFilter,
    },
  ],
})
export class AppModule {}

export const applyMiddleware = (app: INestApplication) => {
  app.use(cookieParser());
};
