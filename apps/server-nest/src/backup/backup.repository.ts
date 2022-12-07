import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import BackupEntity from './backup.entity';
import { Backup, BackupStatus, CreateBackup } from './backup.types';

@Injectable()
export class BackupRepository {
  constructor(
    @InjectRepository(BackupEntity)
    private repository: Repository<BackupEntity>,
  ) {}

  async getLast(): Promise<Backup | null> {
    throw new Error('Not Implemented');
  }

  async save(_backup: CreateBackup): Promise<Backup> {
    throw new Error('Not Implemented');
  }

  async getActive(): Promise<Backup | null> {
    return this.repository.findOne({
      where: {
        status: Not(
          In([
            BackupStatus.Completed,
            BackupStatus.Cancelled,
            BackupStatus.Failed,
          ]),
        ),
      },
    });
  }

  async findById(_id: string): Promise<Backup | null> {
    throw new Error('Not Implemented');
  }
}
