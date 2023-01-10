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

  async save(members: Member[]) {
    await this.reposistory.save(
      members.map((member) => MemberEntity.create(member)),
    );
  }
}
