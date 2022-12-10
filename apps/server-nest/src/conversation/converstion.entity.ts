import { Column, Entity, PrimaryColumn } from 'typeorm';
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
}
