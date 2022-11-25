import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { SlackApiProvider } from './slack-api.provider';

@Module({
  imports: [ConfigModule],
  providers: [SlackApiProvider],
  exports: [SlackApiProvider],
})
export class SlackModule {}
