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
        let response;

        try {
            response = await axiosInstance.get('/conversations.list', config);
        } catch (e) {
            let message = (e.response || {}).data || e.message;
            const status = (e.response || {}).status || -1;

            if (typeof message != 'string') {
                message = JSON.stringify(message, null, 2);
            }

            const err = new Error(`/conversations.list failed. status: ${status}, message: ${message}`);

            throw err;
        }

        if(!response.data.ok) {
            const error = new Error('conversations.list API failed with code ' + response.data.error);
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