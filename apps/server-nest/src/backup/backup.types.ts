export enum BackupStatus {
  CollectingInfo = 'COLLECTING_INFO',
  BackingUp = 'BACKING_UP',
  Cancelled = 'CANCELED',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
}

export type ConversationError = {
  conversationId: string;
  error: string;
};

export interface Backup {
  id: string;
  createdBy: string;
  startedAt: Date;
  endedAt: Date | null;
  status: BackupStatus;
  messagesBackedUp: number;
  currentConversation: string | null;
  backedUpConversations: string[];
  shouldCancel: boolean;
  error: string | null;
  conversationErrors: ConversationError[];
}

export type BackupStats = {
  messages: number;
  conversations: number;
  lastBackupAt: Date | null;
};
