import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { Member } from './member.types';

@Entity('members')
export class MemberEntity implements Member {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text', nullable: true })
  name!: string;

  json!: {
    profile: {
      display_name: string;
      image_24: string;
      image_32: string;
      image_48: string;
      image_72: string;
      image_192: string;
      image_512: string;
      image_1024: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };

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

  static create(createConversation: Member) {
    const conversation = new MemberEntity();

    conversation.id = createConversation.id;
    conversation.name = createConversation.name;
    conversation.json = createConversation.json;

    return conversation;
  }
}
