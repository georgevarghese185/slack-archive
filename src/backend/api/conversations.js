const Response = require('../../types/Response');

const list = async (models) => {
    const conversations = await models.conversations.listAll();
    return new Response({
        status: 200,
        body: { conversations }
    });
}

const get = async (request, models) => {
    const id = request.parameters.id;
    const conversation = await models.conversations.get(id);
    return new Response({ status: 200, body: conversation });
}


module.exports = {
    list,
    get
}