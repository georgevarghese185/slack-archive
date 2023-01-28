import { Controller, Get } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationDto } from './dto/conversation.dto';

@Controller('/v1/conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get()
  async list() {
    const conversations = await this.conversationService.list();
    return {
      conversations: conversations.map(ConversationDto.fromConversation),
    };
  }
}
