const axios = require('axios');
const constants = require('../../constants');
const { withRateLimiting } = require('../../util/slack');

const backupConversations = async (backupId, token, models) => {
    await models.backups.setStatus(backupId, 'COLLECTING_INFO');
    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });

    withRateLimiting(axiosInstance);

    let nextCursor;

    do {
        const config = {
            headers: {
                'Authorization': `Bearer ${token.accessToken}`
            }
        };

        if(nextCursor) {
            config.params = { cursor: nextCursor };
        }

        const response = await axiosInstance.post('/conversations.list', {}, config);

        if(!response.data.ok) {
            const error = new Error('conversations.list API failed');
            error.code = response.data.error;
            throw error;
        }

        const conversations = response.data.channels;
        await models.conversations.add(conversations);

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor != "");
}


module.exports = {
    backupConversations
}