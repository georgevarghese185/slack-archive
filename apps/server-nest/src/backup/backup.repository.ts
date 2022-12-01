import { Injectable } from '@nestjs/common';
import { Backup } from './backup.types';

@Injectable()
export class BackupRepository {
  getLast(): Promise<Backup | null> {
    throw new Error('Not Implemented');
  }
}
