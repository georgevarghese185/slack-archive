const Response = require('../types/Response');

const fromAxiosError = (e) => {
    const status = (e.response || {}).status || -1;
    let body = (e.response || {}).data || e.message;

    if(typeof body !== "string") {
        body = JSON.stringify(body);
    }

    return new Response({ status, body });
}

module.exports = {
    fromAxiosError
}