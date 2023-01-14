import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/member';
import { Repository } from 'typeorm';
import { MemberEntity } from './member.entity';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(MemberEntity) private reposistory: Repository<Member>,
  ) {}

  async findById(id: string): Promise<Member | null> {
    return this.reposistory.findOneBy({ id });
  }

  async list(): Promise<Member[]> {
    return this.reposistory.find();
  }

  async save(members: Member[]) {
    await this.reposistory.save(
      members.map((member) => MemberEntity.create(member)),
    );
  }
}
