import { Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { Conversation } from './conversation.types';

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
    return this.conversationRepository.list();
  }
}
