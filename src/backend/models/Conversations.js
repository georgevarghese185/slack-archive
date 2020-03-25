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



    /**
     * Check if a Conversation with the given ID exists
     * @abstract
     * @param {string} id - The Slack conversation ID
     * @returns {boolean} `true` if a backed up conversation with the given ID exists. `false` otherwise
     */
    async exists(id) {
        throw new Error('Not implemented')
    }


    /**
     * Get the total number of backed up conversations
     *
     * @abstract
     * @returns {number} total number of backed up conversations
     */
    async count() {
        throw new Error('Not implemented');
    }

    /**
     * Add one or more conversations
     *
     * @abstract
     * @param {Array<Object>} conversations - Array of [Conversation objects]{@link https://api.slack.com/types/conversation}.
     * If a conversation with the same ID already exists, it will be updated with
     * the new one in this array
     */
    async add(conversations) {
        throw new Error('Not implemented')
    }
}


module.exports = Conversations;