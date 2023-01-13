import { Controller, Get } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('/v1/members')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Get()
  async list() {
    return {
      members: await this.memberService.list(),
    };
  }
}
