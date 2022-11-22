import { Module } from '@nestjs/common';
import { SlackApiProvider } from './slack-api.provider';

@Module({
  providers: [SlackApiProvider],
  exports: [SlackApiProvider],
})
export class SlackModule {}
