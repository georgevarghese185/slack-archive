const constants = require('../../src/constants');
const Response = require('../types/Response');
const { notFound } = require('../util/response');

const list = async (context) => {
    const conversations = await context.models.conversations.listAll();
    return new Response({
        status: 200,
        body: { conversations }
    });
}

const get = async (context, request) => {
    const id = request.parameters.id;

    const conversation = await context.models.conversations.get(id);

    if(!conversation) {
        return notFound(constants.errorCodes.conversationNotFound, "Could not find a Conversation with the given ID");
    }

    return new Response({ status: 200, body: conversation });
}


module.exports = {
    list,
    get
}