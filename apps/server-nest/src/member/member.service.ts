import { Injectable } from '@nestjs/common';
import { Member } from './member.types';
import { MemberRepository } from './member.repository';

@Injectable()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async list(): Promise<Member[]> {
    return this.memberRepository.list();
  }

  async add(conversations: Member[]) {
    await this.memberRepository.save(conversations);
  }
}
