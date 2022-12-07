import { Module } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
