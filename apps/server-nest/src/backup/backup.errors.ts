import { SlackArchiveError } from 'src/common/error';

export class BackupInProgressError extends SlackArchiveError {
  constructor() {
    super('backup_in_progress', 'Another backup is already in progress', 409);
  }
}
