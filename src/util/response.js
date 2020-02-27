const constants = require('../constants');
const Response = require('../types/Response');

/**
 * Converts an error object thrown from an axios call into a 500 Response
 *
 * @param {Error} e - The error thrown from an axios request
 * @returns {Response} A 500 response
 */
const fromAxiosError = (e) => {
    let body = (e.response || {}).data || e.message;

    if(typeof body !== "string") {
        body = JSON.stringify(body);
    }

    return new Response({ status: 500, body });
}


/**
 * Converts an error response from a Slack API into a 502 Response
 *
 * @param {Object} response - An axios response object from the axios request to
 * the Slack API
 * @returns {Response} a 502 "slack error" Response
 */
const fromSlackError = (response) => {
    return new Response({
        status: 502,
        body: {
            errorCode: constants.errorCodes.slackError,
            message: response.data.error
        }
    });
}

/**
 * Creates a 400 Response
 *
 * @param {string} [errorCode] - Optional error code string. Default will be 'bad_request'
 * @param {string} message - The user message describing the error
 * @returns {Response} a 400 Response
 */
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


/**
 * Creates a 401 Response
 *
 * @param {string} [errorCode] - Optional error code string. Default will be 'unauthorized'
 * @param {string} message - The user message describing the error
 * @returns {Response} a 401 Response
 */
const unauthorized = (...args) => {
    let errorCode = args.length == 2 ? args[0] : constants.errorCodes.unauthorized;
    let message = args.length == 2 ? args[1] : args[0];

    return new Response({
        status: 401,
        body: {
            errorCode,
            message
        }
    })
}

/**
 * Creates a 500 Response
 *
 * @param {string} [errorCode] - Optional error code string. Default will be 'internal_server_error'
 * @param {string} message - The user message describing the error
 * @returns {Response} a 500 Response
 */
const internalError = (...args) => {
    let errorCode = args.length == 2 ? args[0] : constants.errorCodes.internalError;
    let message = args.length == 2 ? args[1] : args[0];

    return new Response({
        status: 500,
        body: {
            errorCode,
            message
        }
    })
}

/**
 * Creates a 404 Response
 *
 * @param {string} [errorCode] - Optional error code string. Default will be 'not_found'
 * @param {string} message - The user message describing the error
 * @returns {Response} a 404 Response
 */
const notFound = (...args) => {
    let errorCode = args.length == 2 ? args[0] : constants.errorCodes.notFound;
    let message = args.length == 2 ? args[1] : args[0];

    return new Response({
        status: 404,
        body: {
            errorCode,
            message
        }
    })
}

module.exports = {
    fromAxiosError,
    fromSlackError,
    badRequest,
    unauthorized,
    internalError,
    notFound
}