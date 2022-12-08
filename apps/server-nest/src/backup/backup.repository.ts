import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import BackupEntity from './backup.entity';
import { Backup, BackupStatus, CreateBackup } from './backup.types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BackupRepository {
  constructor(
    @InjectRepository(BackupEntity)
    private repository: Repository<BackupEntity>,
  ) {}

  async getLast(): Promise<Backup | null> {
    const backups = await this.repository.find({
      order: { endedAt: 'DESC' },
      take: 1,
    });

    return backups[0] || null;
  }

  async save(createBackup: CreateBackup): Promise<Backup> {
    const backup = BackupEntity.create(createBackup);
    backup.id = uuid();

    return this.repository.save(backup);
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

  async findById(id: string): Promise<Backup | null> {
    return this.repository.findOneBy({ id });
  }
}
