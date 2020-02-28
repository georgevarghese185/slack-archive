const Response = require('../../types/Response');

const get = async (request, models) => {
    const limit = parseInt(request.query.limit);
    const conversationId = request.query.conversationId;
    const postsOnly = request.query.postsOnly === 'true';
    let from, to;

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

    const messages = await models.messages.get(from, to, conversationId, postsOnly, limit);

    return new Response({
        status: 200,
        body: { messages: messages.map(m => m.json) }
    });
}


module.exports = {
    get
}