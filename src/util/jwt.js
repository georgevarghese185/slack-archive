const jwt = require('jsonwebtoken');
const Crypto = require('crypto-js');

const sign = (...args) => {
    const [payload, secret] = args;
    let encryptedPayload;

    if (typeof payload === 'object') {
        encryptedPayload = {
            encryptedData: Crypto.AES.encrypt(JSON.stringify(payload), secret).toString()
        }
    } else {
        encryptedPayload = Crypto.AES.encrypt(payload, secret).toString();
    }

    args[0] = encryptedPayload;
    return jwt.sign(...args);
}


const verify = (...args) => {
    const secret = args[1];
    const callback = (typeof args[args.length - 1] === 'function') ? args[args.length - 1] : null;

    const decryptPayload = (decoded) => {
        if(typeof decoded === 'object') {
            const payload = JSON.parse(Crypto.AES.decrypt(decoded.encryptedData, secret).toString(Crypto.enc.Utf8));
            delete decoded.encryptedData;
            return Object.assign(decoded, payload);
        } else {
            return Crypto.AES.decrypt(decoded, secret).toString(Crypto.enc.Utf8);
        }
    }

    if(callback) {
        const newCallback = (err, decoded) => {
            if(!err) {
                decoded = decryptPayload(decoded);
            }
            callback(err, decoded);
        }

        args[args.length - 1] = newCallback;
        return jwt.verify(...args);
    } else {
        return decryptPayload(jwt.verify(...args));
    }
}

module.exports = Object.assign({}, jwt, { verify, sign });