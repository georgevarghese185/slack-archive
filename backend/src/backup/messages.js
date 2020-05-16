const axios = require('axios');
const constants = require('../constants');
const { withRateLimiting } = require('../util/slack');

const backupMessages = async (context, backupId, token) => {
    await context.models.backups.setStatus(backupId, 'BACKING_UP');
    const axiosInstance = axios.create({
        baseURL: constants.slack.apiBaseUrl,
        headers: {
            'Authorization': `Bearer ${token.accessToken}`
        }
    });

    withRateLimiting(axiosInstance);

    const conversations = await context.models.conversations.listAll();

    let backedUp = { count: 0 };

    for (const conversation of conversations) {
        await backupMessagesIn(context, conversation.id, backedUp, axiosInstance, backupId);
    }
}


const backupMessagesIn = async (context, conversationId, backedUp, axiosInstance, backupId) => {
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

        await addMessages(context, messages, conversationId, backedUp, backupId);


        for (const message of messages) {
            if (message.thread_ts && message.thread_ts === message.ts) { // only thread parents, no thread broadcasts
                await backupThread(context, conversationId, message.thread_ts, backedUp, axiosInstance, backupId);
            }
        }

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor);
}


const backupThread = async (context, conversationId, threadTs, backedUp, axiosInstance, backupId) => {
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

        await addMessages(context, messages, conversationId, backedUp, backupId);

        nextCursor = (response.data.response_metadata || {}).next_cursor || "";
    } while (nextCursor);
}


const addMessages = async (context, messages, conversationId, backedUp, backupId) => {
    await context.models.messages.add(
        conversationId,
        messages.map(m => ({
            isPost: !m.thread_ts || m.ts === m.thread_ts || m.subtype === 'thread_broadcast',
            threadTs: m.thread_ts,
            message: m
        }))
    );

    backedUp.count += messages.length;
    await context.models.backups.setMessagesBackedUp(backupId, backedUp.count);
}


module.exports = {
    backupMessages
}