import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/member';
import { Repository } from 'typeorm';
import { MemberEntity } from './member.entity';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(MemberEntity) private repository: Repository<Member>,
  ) {}

  async findById(id: string): Promise<Member | null> {
    return this.repository.findOneBy({ id });
  }

  async list(): Promise<Member[]> {
    return this.repository.find();
  }

  async save(members: Member[]) {
    await this.repository.save(
      members.map((member) => MemberEntity.create(member)),
    );
  }
}
