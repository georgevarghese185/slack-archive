/**
 * The status of a backup task
 *
 * @typedef {('COLLECTING_INFO'|'BACKING_UP'|'CANCELED'|'COMPLETED'|'FAILED')} BackupStatus
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
 * @property {number} messagesBackedUp - Number of messages that have been backed up so far
 * @property {string|null} currentConversation - ID of the Slack conversation that is currently
 * being backed up. Can be null until the backup of the first Conversation starts
 * @property {Array<string>} backedUpConversations - List of IDs of Slack conversatations
 * that have been successfully backed up
 * @property {boolean} shouldCancel - A flag that indicates whether a request has been
 * made to cancel this task.
 * @property {string|null} error - A error message describing why this task failed (if it failed)
 * @property {Array<ConversationError>} conversationErrors A list of conversations that failed to be backed up
 */

/**
 * A record of an error that occured while trying to back up a conversation
 *
 * @typedef {Object} ConversationError
 * @property {string} conversationId ID of the conversation
 * @property {string} error The error message
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
     * @returns {BackupTask|null} The last sucessful backup task. `null` if no
     * backup tasks have been successfully completed till now
     */
    async last() {
        throw new Error('Not implemented');
    }



    /**
     * Get a list of all backups in a running state (ie, not COMPLETED, FAILED or CANCELED)
     *
     * @abstract
     * @returns {Array<BackupTask>} A list of active backup tasks
     */
    async getActive() {
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



    /**
     * Cancel a backup task
     *
     * @abstract
     * @param {string} id - The backup task ID
     */
    async cancel(id) {
        throw new Error('Not implemented');
    }



    /**
     * Check if the backup task should be canceled. Should return true if
     * cancel() was called with the same ID prioror to this
     *
     * @abstract
     * @param {id} id - The backup task ID
     */
    async shouldCancel(id) {
        throw new Error('Not implemented');
    }



    /**
     * Update the status of a backup task (backup.status)
     *
     * @abstract
     * @param {string} id - The backup task ID
     * @param {BackupStatus} status - The new status
     */
    async setStatus(id, status) {
        throw new Error('Not implemented');
    }


    /**
     * Sets the endedAt field of a backup task
     *
     * @param {string} id The backup task ID
     * @param {number} time The time at which the backup ended in UNIX time milliseconds
     */
    async setEndedAt(id, time) {
        throw new Error('Not implemented');
    }


    /**
     * Update the total number of messages that have been backed up (backup.messagesBackedUp)
     *
     * @abstract
     *
     * @param {number} numOfMessages The number of messages that have been successfully
     * backed up
     */
    async setMessagesBackedUp(id, numOfMessages) {
        throw new Error('Not implemented');
    }


    /**
     * Set the conversation that is currently being backed up (backup.currentConversation)
     *
     * @abstract
     * @param {string} id - The backup task ID
     * @param {string} conversationId The ID of the conversation currently being
     * backed up
     */
    async setCurrentConversation(id, conversationId) {
        throw new Error('Not implemented');
    }


    /**
     * Add a conversation ID to the list of conversations who's messages have been
     * backed up (backup.backedUpConversations)
     *
     * @abstract
     * @param {string} id - The backup task ID
     * @param {string} conversationId The ID of conversation who's messages have been
     * completely backed up
     */
    async conversationBackupDone(id, conversationId) {
        throw new Error('Not implemented');
    }

    /**
     * Set the error field to a message explaining the failed backup
     *
     * @abstract
     * @param {string} id - The backup task ID
     * @param {string} message - Error message
     */
    async setError(id, message) {
        throw new Error('Not implemented');
    }


  /**
   * Record an error that occured while trying to back up a conversation
   *
   * @param {string} id - The backup task ID
   * @param {string} conversationId The conversation's ID
   * @param {string} error The error message
   */
  async addConversationError(id, conversationId, error) {
    throw new Error("Not implemented");
  }
}

module.exports = Backups;