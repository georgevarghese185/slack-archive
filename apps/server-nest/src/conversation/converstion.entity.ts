import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { Conversation } from './conversation.types';

@Entity('conversations')
export default class ConversationEntity implements Conversation {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text', nullable: true })
  name!: string;

  json!: object;

  @Column({ name: 'json', type: 'text' })
  private _json!: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  private setJson() {
    if (this.json) {
      this._json = JSON.stringify(this.json);
    }
  }

  @AfterLoad()
  private loadJson() {
    if (this._json) {
      this.json = JSON.parse(this._json);
    }
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

  static create(createConversation: Conversation) {
    const conversation = new ConversationEntity();

    conversation.id = createConversation.id;
    conversation.name = createConversation.name;
    conversation.json = createConversation.json;

    return conversation;
  }
}
