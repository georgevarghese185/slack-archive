import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { Message } from './message.types';

@Injectable()
export class MessageService {
  constructor(private messageRepository: MessageRepository) {}

  getCount() {
    return this.messageRepository.getCount();
  }

  add(messages: Message[]) {
    return this.messageRepository.save(messages);
  }
}
