const Response = require('../../types/Response');

const get = async (request, models) => {
    const messages = await models.messages.get();

    return new Response({
        status: 200,
        body: { messages: messages.map(m => m.json) }
    });
}


module.exports = {
    get
}