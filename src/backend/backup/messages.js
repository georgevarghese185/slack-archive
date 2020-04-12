const axios = require('axios');
const constants = require('../../constants');
const { withRateLimiting } = require('../../util/slack');

const backupMessages = async (backupId, token, models) => {
    await models.backups.setStatus(backupId, 'BACKING_UP');
    const axiosInstance = axios.create({
        baseURL: constants.slack.apiBaseUrl,
        headers: {
            'Authorization': `Bearer ${token.accessToken}`
        }
    });

    withRateLimiting(axiosInstance);

    const conversations = await models.conversations.listAll();

    let backedUp = { count: 0 };

    for (const conversation of conversations) {
        await backupMessagesIn(conversation.id, backedUp, axiosInstance, backupId, models);
    }
}


const backupMessagesIn = async (conversationId, backedUp, axiosInstance, backupId, models) => {
    const config = {
        params: {
            channel: conversationId
        }
    };

    let nextCursor;

    do {
        if (nextCursor) {
            config.params.cursor = nextCursor;
        }

        let response;

        try {
            response = await axiosInstance.get('/conversations.history', config);
        } catch (e) {
            let message = (e.response || {}).data || e.message;
            const status = (e.response || {}).status || -1;

            if (typeof message != 'string') {
                message = JSON.stringify(message, null, 2);
            }

            const err = new Error(`/conversations.history failed. status: ${status}, message: ${message}`);

            throw err;
        }

        if (!response.data.ok) {
            const error = new Error('/conversations.history API failed with code ' + response.data.error);
            throw error;
        }

        const messages = response.data.messages;

        await addMessages(messages, conversationId, backedUp, backupId, models);


        for (const message of messages) {
            if (message.thread_ts && message.thread_ts === message.ts) { // only thread parents, no thread broadcasts
                await backupThread(conversationId, message.thread_ts, backedUp, axiosInstance, backupId, models);
            }
        }

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor);
}


const backupThread = async (conversationId, threadTs, backedUp, axiosInstance, backupId, models) => {
    const config = {
        params: {
            channel: conversationId,
            ts: threadTs
        }
    }

    let nextCursor;

    do {
        if (nextCursor) {
            config.params.cursor = nextCursor;
        }

        let response;

        try {
            response = await axiosInstance.get('/conversations.replies', config);
        } catch (e) {
            let message = (e.response || {}).data || e.message;
            const status = (e.response || {}).status || -1;

            if (typeof message != 'string') {
                message = JSON.stringify(message, null, 2);
            }

            const err = new Error(`/conversations.replies failed. status: ${status}, message: ${message}`);

            throw err;
        }

        if (!response.data.ok) {
            const error = new Error('/conversations.replies API failed with code ' + response.data.error);
            throw error;
        }

        const messages = response.data.messages;

        await addMessages(messages, conversationId, backedUp, backupId, models);

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor);
}


const addMessages = async (messages, conversationId, backedUp, backupId, models) => {
    await models.messages.add(conversationId, messages);

    backedUp.count += messages.length;
    await models.backups.setMessagesBackedUp(backupId, backedUp.count);
}


module.exports = {
    backupMessages
}