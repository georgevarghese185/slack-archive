import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { SlackModule } from 'src/slack/slack.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Module({
  controllers: [AuthController],
  imports: [ConfigModule, SlackModule],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
