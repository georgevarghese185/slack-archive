const axios = require('axios');
const constants = require('../../constants');

const backupConversations = async (backupId, token, models) => {
    await models.backups.setStatus(backupId, 'COLLECTING_INFO');
    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });

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

        const conversations = response.data.channels;

        for (const conversation of conversations) {
            await models.conversations.add(conversation.id, conversation.name, conversation);
        }

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor != "");
}


module.exports = {
    backupConversations
}