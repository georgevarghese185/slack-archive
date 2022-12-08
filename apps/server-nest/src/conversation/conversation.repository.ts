import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
