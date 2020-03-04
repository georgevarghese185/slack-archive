const axios = require('axios');
const constants = require('../../constants');

const backupConversations = async (backupId, token, models) => {
    await models.backups.setStatus(backupId, 'COLLECTING_INFO');
    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });

    const response = await axiosInstance.post('/conversations.list', {}, {
        headers: {
            'Authorization': `Bearer ${token.accessToken}`
        }
    });

    const conversations = response.data.channels;

    for(const conversation of conversations) {
        await models.conversations.add(conversation.id, conversation.name, conversation);
    }
}


module.exports = {
    backupConversations
}