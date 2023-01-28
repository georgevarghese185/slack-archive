import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserId } from 'src/auth';
import { AccessToken } from 'src/auth';
import { BackupService } from './backup.service';
import { BackupDto } from './dto';

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
      running: running ? [BackupDto.fromBackup(running)] : [],
    };
  }

  @Get(':id')
  async getBackup(@Param('id') id: string) {
    const backup = await this.backupService.get(id);
    return BackupDto.fromBackup(backup);
  }

  @Post('new')
  async startBackup(
    @UserId() userId: string,
    @AccessToken() accessToken: string,
  ) {
    const backup = await this.backupService.createBackup(userId, accessToken);
    return {
      backupId: backup.id,
    };
  }
}
