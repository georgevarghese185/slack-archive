import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index('messages_pkey', ['ts', 'conversation_id'])
@Entity('messages')
export default class MessageEntity {
  @PrimaryColumn({ type: 'text' })
  ts!: string;

  @Column({ type: 'text' })
  conversation_id!: string;

  @Column({ type: 'text', nullable: true })
  thread_ts!: string;

  @Column({ type: 'bool' })
  is_post!: boolean;

  json!: object;

  @Column({ name: 'json', type: 'text' })
  private _json!: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt!: Date;
}
