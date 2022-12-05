import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Backup, BackupStatus, ConversationError } from './backup.types';

@Entity({ name: 'backups' })
export default class BackupEntity implements Backup {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text', name: 'created_by' })
  createdBy!: string;

  @Column({
    nullable: false,
    name: 'started_at',
    type: 'timestamp with time zone',
  })
  startedAt!: Date;

  @Column({
    nullable: true,
    type: 'timestamp with time zone',
    name: 'ended_at',
  })
  endedAt!: Date | null;

  @Column({ type: 'text' })
  status!: BackupStatus;

  @Column({ name: 'messages_backed_up' })
  messagesBackedUp!: number;

  @Column({ type: 'text', nullable: true, name: 'current_conversation' })
  currentConversation!: string | null;

  backedUpConversations!: string[];

  @Column({
    type: 'text',
    nullable: false,
    name: 'backed_up_conversations',
  })
  private _backedUpConversations!: string;

  @Column({ name: 'should_cancel' })
  shouldCancel!: boolean;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @Column({
    nullable: true,
    name: 'conversation_errors',
    type: 'json',
    default: '[]',
  })
  conversationErrors!: ConversationError[];

  @Column({ type: 'timestamp with time zone', nullable: false })
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt!: Date;
}
