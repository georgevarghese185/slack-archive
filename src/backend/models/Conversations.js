/**
 * Interface of a data model for backed up Slack conversations. This class must
 * be extended and implemented
 *
 * @interface Conversations
 */
class Conversations {
    /**
     * Get the ID and name of all backed up Slack conversations
     *
     * @abstract
     * @returns {Array<Object>} List of all conversations. Each object in the
     * array has the structure { id, name } with the conversation ID and name
     */
    async listAll() {
        throw new Error('Not implemented')
    }

    /**
     * Get all info on a Slack conversation of the given ID
     *
     * @abstract
     * @param {string} id - The Slack conversation ID
     * @returns {Object|null} A Slack [Conversation object]{@link https://api.slack.com/types/conversation}.
     * Returns `null` if no conversation with the given ID was found
     */
    async get(id) {
        throw new Error('Not implemented')
    }
}


module.exports = Conversations;