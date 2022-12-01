import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageRepository {
  getCount(): Promise<number> {
    throw new Error('Not implemented');
  }
}
