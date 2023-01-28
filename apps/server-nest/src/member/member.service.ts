import { Injectable } from '@nestjs/common';
import { Member } from './member.types';
import { MemberRepository } from './member.repository';
import { MemberNotFoundError } from './member.errors';

@Injectable()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async get(id: string): Promise<Member> {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundError();
    }

    return member;
  }

  list(): Promise<Member[]> {
    return this.memberRepository.list();
  }

  async add(conversations: Member[]) {
    await this.memberRepository.save(conversations);
  }
}
