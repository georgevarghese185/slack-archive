import { Backup, BackupStatus } from '../backup.types';

export class BackupDto {
  id!: string;
  status!: BackupStatus;
  error!: string | null;
  messagesBackedUp!: number;
  currentConversation!: string | null;
  backedUpConversations!: string[];

  static fromBackup(backup: Backup): BackupDto {
    const backupDto = new BackupDto();
    backupDto.id = backup.id;
    backupDto.status = backup.status;
    backupDto.error = backup.error;
    backupDto.messagesBackedUp = backup.messagesBackedUp;
    backupDto.currentConversation = backup.currentConversation;
    backupDto.backedUpConversations = backup.backedUpConversations;

    return backupDto;
  }
}
