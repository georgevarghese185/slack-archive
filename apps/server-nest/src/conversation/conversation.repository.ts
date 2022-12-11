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

  async save(_conversations: Conversation[]) {
    throw new Error('Not Implemented');
  }

  async list(): Promise<Conversation[]> {
    return this.repository.find();
  }
}
