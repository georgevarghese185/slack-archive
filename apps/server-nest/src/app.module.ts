import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [AuthModule, ConfigModule, SlackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
