import { INestApplication, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DefaultExceptionFilter } from './common/error/default.exception-filter';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './config/config.module';
import { SlackModule } from './slack/slack.module';
import { DatabaseModule } from './database/database.module';
import cookieParser from 'cookie-parser';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    SlackModule,
    LoggerModule,
    DatabaseModule,
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
