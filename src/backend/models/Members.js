/**
 * Interface of a data model for backed information about Slack workspace users.
 * This class must be extended and implemented
 *
 * @interface Members
 */
class Members {
    /**
     * Get all info about a user in the Slack workspace
     *
     * @abstract
     * @param {string} id - The user's ID
     * @returns {Object|null} A Slack [User object]{@link https://api.slack.com/types/user}.
     * Returns `null` if no user with the given ID was found
     */
    async get(id) {
        throw new Error('Not implemented')
    }


    /**
     * Add one or more members
     *
     * @abstract
     * @param {Object} members Array of [User objects]{@link https://api.slack.com/types/user}.
     * If a member with the same ID already exists, it will be updated with the
     * new one in this array
     */
    async add(members) {
        throw new Error('Not implemented')
    }
}


module.exports = Members;