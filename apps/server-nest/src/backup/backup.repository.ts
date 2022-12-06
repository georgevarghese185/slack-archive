import { Injectable } from '@nestjs/common';
import { Backup, CreateBackup } from './backup.types';

@Injectable()
export class BackupRepository {
  async getLast(): Promise<Backup | null> {
    throw new Error('Not Implemented');
  }

  async save(_backup: CreateBackup): Promise<Backup> {
    throw new Error('Not Implemented');
  }

  async getActive(): Promise<Backup | null> {
    throw new Error('Not Implemented');
  }

  async findById(_id: string): Promise<Backup | null> {
    throw new Error('Not Implemented');
  }
}
