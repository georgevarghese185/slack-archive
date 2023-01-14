import { Injectable } from '@nestjs/common';
import { Member } from './member.types';
import { MemberRepository } from './member.repository';
import { MemberDto } from './dto';
import { MemberNotFoundError } from './member.errors';

@Injectable()
export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  async get(id: string): Promise<MemberDto> {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundError();
    }

    return MemberDto.fromMember(member);
  }

  async list(): Promise<MemberDto[]> {
    const members = await this.memberRepository.list();
    return members.map((member) => MemberDto.fromMember(member));
  }

  async add(conversations: Member[]) {
    await this.memberRepository.save(conversations);
  }
}
