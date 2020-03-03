/**
 * The status of a backup task
 *
 * @typedef {('COLLECTING_INFO'|'BACKING_UP'|'CANCELED'|'COMPLETED'|'RATE_LIMITED'|'FAILED')} BackupStatus
 */


/**
 * A backup task that has been started to backup Slack messages
 *
 * @typedef {Object} BackupTask
 * @property {string} id - Unique ID of the task
 * @property {number} createdAt - The time the task was created at (in UNIX time milliseconds)
 * @property {string} createdBy - The Slack user ID of the user who started this task
 * @property {number|null} endedAt - The the time the task was ended at (in UNIX time milliseconds)
 * @property {BackupStatus} status - The current status of this task
 * @property {string|null} firstMessage - `ts` of the first backed up message. Can be `null` till
 * the first message is backed up
 * @property {string|null} lastMessage - `ts` of the last backed up message. Can be `null` till
 * the last message is backed up
 * @property {number} messagesBackedUp - Number of messages that have been backed up so far
 * @property {string|null} currentConversation - ID of the Slack conversation that is currently
 * being backed up. Can be null until the backup of the first Conversation starts
 * @property {Array<string>} backedUpConversations - List of IDs of Slack conversatations
 * that have been successfully backed up
 * @property {boolean} shouldCancel - A flag that indicates whether a request has been
 * made to cancel this task.
 * @property {string|null} error - A error message describing why this task failed (if it failed)
 */


/**
 * An interface of the data model for Slack backup tasks. This class must be
 * extended and implemented
 *
 * @interface Backups
 */
class Backups {
    /**
     * Create a new backup task
     *
     * @abstract
     * @param {string} backupId - unique ID for the newly created backup task
     * @param {string} userId - The ID of the user who started this backup
     */
    async create(backupId, userId) {
        throw new Error('Not implemented');
    }



    /**
     * Get the last successful backup task
     *
     * @abstract
     * @returns {BackupTask|null} The last backup sucessful task. `null` if no
     * backup tasks have been successfully completed till now
     */
    async last() {
        throw new Error('Not implemented');
    }



    /**
     * Get info on a backup task
     *
     * @abstract
     * @param {string} id - The backup task ID
     * @returns {BackupTask|null} The backup task or `null` if no task with the given
     * ID was found
     */
    async get(id) {
        throw new Error('Not implemented');
    }
}

module.exports = Backups;