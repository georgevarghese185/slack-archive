const Response = require('../../types/Response');

const get = async (request, models) => {
    const memberId = request.parameters.id;
    const member = await models.members.get(memberId);

    return new Response({ status: 200, body: member });
}

module.exports = {
    get
}