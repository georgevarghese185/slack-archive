import { Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { Conversation } from './conversation.types';
import { ConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(private conversationRepository: ConversationRepository) {}

  getCount() {
    return this.conversationRepository.getCount();
  }

  async add(conversations: Conversation[]) {
    await this.conversationRepository.save(conversations);
  }

  async list() {
    const conversations = await this.conversationRepository.list();
    return conversations.map((conversation) =>
      ConversationDto.fromConversation(conversation),
    );
  }
}
