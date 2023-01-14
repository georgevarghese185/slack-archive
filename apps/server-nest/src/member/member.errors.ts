import { SlackArchiveError } from 'src/common';

export class MemberNotFoundError extends SlackArchiveError {
  constructor() {
    super('member_not_found', 'Could not find a member with the given ID', 404);
  }
}
