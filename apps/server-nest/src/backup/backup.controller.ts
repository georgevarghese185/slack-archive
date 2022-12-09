import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserId } from 'src/auth';
import { BackupService } from './backup.service';

@Controller('/v1/backups')
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Get('stats')
  getStats() {
    return this.backupService.getBackupStats();
  }

  @Get('running')
  async getRunning() {
    const running = await this.backupService.getRunning();

    return {
      running: running ? [running] : [],
    };
  }

  @Get(':id')
  getBackup(@Param('id') id: string) {
    return this.backupService.get(id);
  }

  @Post('new')
  async startBackup(@UserId() userId: string) {
    const backup = await this.backupService.startBackup(userId);
    return {
      backupId: backup.id,
    };
  }
}
