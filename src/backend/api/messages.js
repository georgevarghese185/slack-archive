const Response = require('../../types/Response');

const get = async (request, models) => {
    const limit = parseInt(request.query.limit);
    const messages = await models.messages.get(limit);

    return new Response({
        status: 200,
        body: { messages: messages.map(m => m.json) }
    });
}


module.exports = {
    get
}