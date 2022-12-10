import { InternalSlackArchiveError, SlackArchiveError } from 'src/common';

export class BackupCancelledError extends InternalSlackArchiveError {
  constructor() {
    super('Backup cancelled');
  }
}

export class BackupInProgressError extends SlackArchiveError {
  constructor() {
    super('backup_in_progress', 'Another backup is already in progress', 409);
  }
}

export class BackupNotFoundError extends SlackArchiveError {
  constructor() {
    super(
      'backup_not_found',
      'Could not find a backup task with the given ID',
      404,
    );
  }
}
