import { Member } from '../member';

export type Conversation = {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  created: number;
  is_archived: boolean;
  is_general: boolean;
  unlinked: number;
  name_normalized: string;
  is_shared: boolean;
  parent_conversation: null;
  creator: string;
  is_ext_shared: boolean;
  is_org_shared: boolean;
  shared_team_ids: string[];
  pending_shared: string[];
  pending_connected_team_ids: string[];
  is_pending_ext_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
  num_members: number;
};

export type ConversationGeneratorOptions = {
  maxConversations?: number;
  members?: Member[];
};

export declare class ConversationGenerator {
  constructor(options?: ConversationGeneratorOptions);

  generateConversation(): Conversation;

  generateConversations(): Conversation[];
}
