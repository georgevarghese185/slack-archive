import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
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
  startBackup(@UserId() userId: string) {
    this.backupService.startBackup(userId);
  }
}
