import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'src/common/logger/logger.module';
import { ConfigModule } from 'src/config/config.module';
import { SlackModule } from 'src/slack/slack.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

@Module({
  controllers: [AuthController],
  imports: [ConfigModule, SlackModule, LoggerModule],
  providers: [
    AuthService,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
