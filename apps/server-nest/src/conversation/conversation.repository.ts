import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationRepository {
  getCount(): Promise<number> {
    throw new Error('Not implemented');
  }
}
