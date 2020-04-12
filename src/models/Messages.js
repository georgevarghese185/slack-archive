/**
 * Interface of a data model for backed up message from the Slack workspace.
 * This class must be extended and implemented
 *
 * @interface Messages
 */
class Messages {
    /**
     *
     * @abstract
     * @param {Object|null} from - Fetch messages from this time stamp onwards. Structure
     * should be { value, inclusive } where `value` is a Slack ts string and `inclusive`
     * can be `true` (include messages with a ts equal to `value`) or `false` (don't include `value`)
     * @param {Object|null} to - Fetch messages up to this time stamp onwards. Structure
     * should be { value, inclusive } where `value` is a Slack ts string and `inclusive`
     * can be `true` (include messages with a ts equal to `value`) or `false` (don't include `value`)
     * @param {string|null} conversationId - Only fetch messages from this Slack conversation
     * @param {boolean} postsOnly - Only fetch messages that were posted directly to a
     * conversation (no messages that were only replies to a thread)
     * @param {string|null} threadTs - The `ts` of the parent message of a thread. Only messages
     * from this thread will be returned
     * @param {number} limit - Limit maximum number of messages to be returned (default: 100)
     * @returns {Array<Object>} List of messages. Each message object will have the type of
     * a Slack [message object]{@link https://api.slack.com/events/message}
     */
    get(from, to, conversationId, postsOnly, threadTs, limit) {
        throw new Error('Not implemented');
    }



    /**
     * Check if a thread with the given ID exists
     *
     * @abstract
     * @param {string} threadTs - The ts of the thread (the ts of the thread's parent message)
     * @param {string} [conversationId] - The Conversation ID. If passed, checks if the given
     * thread exists inside this conversation. Otherwise, checks if this thread exists anywhere
     * @returns {boolean} `true` if the thread exists, `false` otherwise
     */
    async threadExists(threadTs, conversationId) {
        throw new Error('Not implemented');
    }


    /**
     * Get the total number of backed up messages
     *
     * @abstract
     * @returns {number} total number of backed up messages
     */
    async count() {
        throw new Error('Not implemented');
    }


    /**
     * Add one or more messages from a conversation
     *
     * @abstract
     * @param {string} conversationId The ID of the conversation these messages are from
     * @param {Array<Object>} messages An Array of [message objects]{@link https://api.slack.com/events/message}
     */
    async add(conversationId, messages) {
        throw new Error('Not implemented');
    }
}

module.exports = Messages;