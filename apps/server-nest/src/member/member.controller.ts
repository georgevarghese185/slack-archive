import { Controller, Get, Param } from '@nestjs/common';
import { MemberDto } from './dto';
import { MemberService } from './member.service';

@Controller('/v1/members')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Get()
  async list() {
    const members = await this.memberService.list();
    return {
      members: members.map(MemberDto.fromMember),
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const member = await this.memberService.get(id);
    return MemberDto.fromMember(member);
  }
}
