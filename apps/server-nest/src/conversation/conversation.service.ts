import { Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';

@Injectable()
export class ConversationService {
  constructor(private conversationRepository: ConversationRepository) {}

  getCount() {
    return this.conversationRepository.getCount();
  }
}
