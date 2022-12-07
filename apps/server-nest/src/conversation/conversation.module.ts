import { Module } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { ConversationService } from './conversation.service';

@Module({
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
})
export class ConversationModule {}
