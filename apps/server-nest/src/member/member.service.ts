import { Injectable } from '@nestjs/common';
import { Member } from './member.types';
import { MemberRepository } from './member.repository';
import { MemberDto } from './dto';

@Injectable()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async list(): Promise<MemberDto[]> {
    const members = await this.memberRepository.list();
    return members.map((member) => MemberDto.fromMember(member));
  }

  async add(conversations: Member[]) {
    await this.memberRepository.save(conversations);
  }
}
