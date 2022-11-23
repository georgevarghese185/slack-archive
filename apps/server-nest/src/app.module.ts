import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './config/config.module';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [AuthModule, ConfigModule, SlackModule, LoggerModule],
  controllers: [AppController],
})
export class AppModule {}
