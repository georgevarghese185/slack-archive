import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { isReply } from './message.util';
import { Message } from './message.types';

@Index('messages_pkey', ['ts', 'conversation_id'])
@Entity('messages')
export default class MessageEntity {
  @PrimaryColumn({ type: 'text' })
  ts!: string;

  @Column({ type: 'text' })
  conversation_id!: string;

  @Column({ type: 'text', nullable: true })
  thread_ts!: string | null;

  @Column({ type: 'bool' })
  is_post!: boolean;

  json!: object;

  @Column({ name: 'json', type: 'text' })
  private _json!: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt!: Date;

  static create(message: Message): MessageEntity {
    const messageEntity = new MessageEntity();
    messageEntity.conversation_id = message.conversationId;
    messageEntity.json = message;
    messageEntity.ts = message.ts;
    messageEntity.thread_ts = message.threadTs || null;
    messageEntity.is_post = !isReply(message);

    return messageEntity;
  }
}
