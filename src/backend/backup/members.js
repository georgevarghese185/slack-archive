const axios = require('axios');
const constants = require('../../constants');

const backupMembers = async (backupId, token, models) => {
    await models.backups.setStatus(backupId, 'COLLECTING_INFO');
    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });

    const config = {
        headers: {
            'Authorization': `Bearer ${token.accessToken}`
        }
    }

    const response = await axiosInstance.get('/users.list', config);

    const members = response.data.members;

    models.members.add(members);
}


module.exports = {
    backupMembers
}