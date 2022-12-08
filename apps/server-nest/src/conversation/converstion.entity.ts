import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('conversations')
export default class ConversationEntity {
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
