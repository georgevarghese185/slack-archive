import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import MessageEntity from './message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private repository: Repository<MessageEntity>,
  ) {}

  getCount(): Promise<number> {
    return this.repository.count();
  }
}
