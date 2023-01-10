import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './member.entity';
import { MemberRepository } from './member.repository';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity])],
  providers: [MemberRepository, MemberService],
  exports: [MemberService],
})
export class MemberModule {}
