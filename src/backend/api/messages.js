const Response = require('../../types/Response');
const { badRequest } = require('../../util/response');


const get = async (request, models) => {
    const limit = parseInt(request.query.limit);
    const conversationId = request.query.conversationId;
    const postsOnly = request.query.postsOnly === 'true';
    const thread = request.query.thread;
    let from, to;

    if(request.query.from && request.query.after) {
        return badRequest("'from' and 'after' parameters cannot be used together");
    }

    if (request.query.to && request.query.before) {
        return badRequest("'to' and 'before' parameters cannot be used together");
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