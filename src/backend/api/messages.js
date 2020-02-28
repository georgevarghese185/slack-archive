const constants = require('../../constants');
const Response = require('../../types/Response');
const { badRequest, notFound } = require('../../util/response');


const get = async (request, models) => {
    const limit = parseInt(request.query.limit);
    const conversationId = request.query.conversationId;
    const postsOnly = request.query.postsOnly === 'true';
    const thread = request.query.thread;
    let from, to;

    // make sure from and after/to and before are not given together
    if(request.query.from && request.query.after) {
        return badRequest("'from' and 'after' parameters cannot be used together");
    }

    if (request.query.to && request.query.before) {
        return badRequest("'to' and 'before' parameters cannot be used together");
    }


    // Make sure any ts strings have a valid format
    try {
        const validateTs = (key) => {
            if (request.query[key] && !request.query[key].match(/^\d+\.\d+$/)) {
                throw new Error(`'${key}' is not a valid Slack ts string`);
            }
        }

        ['from', 'to', 'before', 'after', 'thread'].forEach(validateTs);
    } catch (e) {
        return badRequest(e.message);
    }


    if(conversationId) {
        const conversationExists = await models.conversations.exists(conversationId);
        if(!conversationExists) {
            return notFound(constants.errorCodes.conversationNotFound, "Could find a conversation with the given ID");
        }
    }



    if(request.query.from) {
        from = { value: request.query.from, inclusive: true };
    }

    if (request.query.to) {
        to = { value: request.query.to, inclusive: true };
    }

    if (request.query.after) {
        from = { value: request.query.after, inclusive: false };
    }

    if (request.query.before) {
        to = { value: request.query.before, inclusive: false };
    }

    const messages = await models.messages.get(from, to, conversationId, postsOnly, thread, limit);

    return new Response({
        status: 200,
        body: { messages: messages.map(m => m.json) }
    });
}


module.exports = {
    get
}