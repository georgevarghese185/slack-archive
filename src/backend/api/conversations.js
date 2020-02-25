const Response = require('../../types/Response');

const list = async (models) => {
    const conversations = await models.conversations.listAll();
    return new Response({
        status: 200,
        body: { conversations }
    });
}


module.exports = {
    list
}