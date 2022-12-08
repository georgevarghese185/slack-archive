import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import MessageEntity from './message.entity';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
