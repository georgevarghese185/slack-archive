const constants = require('../../constants');
const Response = require('../../types/Response');
const { notFound } = require('../../util/response');

const get = async (request, models) => {
    const memberId = request.parameters.id;
    const member = await models.members.get(memberId);

    if(!member) {
        return notFound(constants.errorCodes.memberNotFound, 'A member with the given ID could not be found');
    }

    return new Response({ status: 200, body: member });
}

module.exports = {
    get
}