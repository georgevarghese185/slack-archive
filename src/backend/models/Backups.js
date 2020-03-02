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



class Backups {
    /**
     * Get the last successful backup task
     *
     * @returns {BackupTask|null} The last backup sucessful task. `null` if no
     * backup tasks have been successfully completed till now
     */
    async last() {
        throw new Error('Not implemented');
    }
}

module.exports = Backups;