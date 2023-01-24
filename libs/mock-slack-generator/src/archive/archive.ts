import type {
  PostMessage,
  ThreadMessage,
  ThreadParentMessage,
} from '../message';
import type { Conversation } from '../conversation';
import type { Member } from '../member';

export type ArchiveThread = {
  parent: ThreadParentMessage;
  replies: ThreadMessage[];
};

export type ArchiveConversation = {
  conversation: Conversation;
  messages: PostMessage[];
  threads: ArchiveThread[];
};

export type Archive = {
  members: Member[];
  conversations: ArchiveConversation[];
};
