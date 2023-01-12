import { Conversation } from '../conversation.types';

export class ConversationDto {
  id!: string;
  name!: string;

  static fromConversation(conversation: Conversation) {
    const conversationDto = new ConversationDto();
    conversationDto.id = conversation.id;
    conversationDto.name = conversation.name;

    return conversationDto;
  }
}
