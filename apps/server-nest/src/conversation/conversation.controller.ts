import { Controller, Get } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('/v1/conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get()
  async list() {
    return {
      conversations: await this.conversationService.list(),
    };
  }
}
