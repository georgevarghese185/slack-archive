const axios = require('axios');
const constants = require('../../constants');
const { withRateLimiting } = require('../../util/slack');

const backupMembers = async (backupId, token, models) => {
    await models.backups.setStatus(backupId, 'COLLECTING_INFO');
    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });

    withRateLimiting(axiosInstance);

    const config = {
        headers: {
            'Authorization': `Bearer ${token.accessToken}`
        }
    }

    let nextCursor;

    do {
        if (nextCursor) {
            config.params = { cursor: nextCursor };
        }

        const response = await axiosInstance.get('/users.list', config);

        if (!response.data.ok) {
            const error = new Error('users.list API failed');
            throw error;
        }

        const members = response.data.members;

        models.members.add(members);

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor)
}


module.exports = {
    backupMembers
}