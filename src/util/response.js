const constants = require('../constants');
const Response = require('../types/Response');

const fromAxiosError = (e) => {
    const status = (e.response || {}).status || -1;
    let body = (e.response || {}).data || e.message;

    if(typeof body !== "string") {
        body = JSON.stringify(body);
    }

    return new Response({ status, body });
}


const badRequest = (...args) => {
    let errorCode = args.length == 2 ? args[0] : constants.errorCodes.badRequest;
    let message = args.length == 2 ? args[1] : args[0];

    return new Response({
        status: 400,
        body: {
            errorCode,
            message
        }
    });
}

module.exports = {
    fromAxiosError,
    badRequest
}