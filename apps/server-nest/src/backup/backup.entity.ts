import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import {
  Backup,
  BackupStatus,
  ConversationError,
  CreateBackup,
} from './backup.types';

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

  @BeforeInsert()
  @BeforeUpdate()
  private async setBackupedUpConversations() {
    this._backedUpConversations = JSON.stringify(this.backedUpConversations);
  }

  @BeforeInsert()
  private async setDates() {
    const now = new Date();

    if (!this.createdAt) {
      this.createdAt = now;
    }

    if (!this.updatedAt) {
      this.updatedAt = now;
    }
  }

  @BeforeUpdate()
  private async updateDate() {
    this.updatedAt = new Date();
  }

  @AfterLoad()
  private async loadBackedUpConversations() {
    if (!this._backedUpConversations) {
      return;
    }
    this.backedUpConversations = JSON.parse(this._backedUpConversations);
  }

  static create(createBackup: CreateBackup) {
    const backup = new BackupEntity();

    backup.createdBy = createBackup.createdBy;
    backup.startedAt = createBackup.startedAt;
    backup.endedAt = createBackup.endedAt;
    backup.status = createBackup.status;
    backup.messagesBackedUp = createBackup.messagesBackedUp;
    backup.currentConversation = createBackup.currentConversation;
    backup.backedUpConversations = createBackup.backedUpConversations;
    backup.shouldCancel = createBackup.shouldCancel;
    backup.error = createBackup.error;
    backup.conversationErrors = createBackup.conversationErrors;

    return backup;
  }
}
