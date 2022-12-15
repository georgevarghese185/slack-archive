import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.types';
import ConversationEntity from './converstion.entity';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectRepository(ConversationEntity)
    private repository: Repository<ConversationEntity>,
  ) {}

  getCount(): Promise<number> {
    return this.repository.count();
  }

  async save(conversations: Conversation[]) {
    await this.repository.save(conversations.map(ConversationEntity.create));
  }

  async list(): Promise<Conversation[]> {
    return this.repository.find();
  }
}
