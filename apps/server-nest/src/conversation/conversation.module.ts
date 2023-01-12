import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationRepository } from './conversation.repository';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import ConversationEntity from './converstion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity])],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
  controllers: [ConversationController],
})
export class ConversationModule {}
