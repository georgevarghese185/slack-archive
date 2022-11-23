import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/common/logger/logger.module';
import { ConfigModule } from 'src/config/config.module';
import { SlackModule } from 'src/slack/slack.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Module({
  controllers: [AuthController],
  imports: [ConfigModule, SlackModule, LoggerModule],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
