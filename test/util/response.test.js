const axios = require('axios');
const { expect } = require('chai');
const moxios = require('moxios');
const { fromAxiosError } = require('../../src/util/response');

module.exports = () => {
    describe('fromAxiosError()', () => {
        it('non 200 response', async() => {
            const axiosInstance = axios.create();

            moxios.install(axiosInstance);
            moxios.stubRequest('/', {
                status: 404,
                responseText: "Not Found"
            });

            try {
                await axiosInstance.get('/');
            } catch(e) {
                const response = fromAxiosError(e);
                expect(response.status).to.equal(404);
                expect(response.body).to.equal("Not Found");

                moxios.uninstall(axiosInstance);
                return
            }

            throw new Error('Should have failed');
        });


        it('non 200 with non-string body', async () => {
            const axiosInstance = axios.create();

            const responseBody = { reason: "Not Found", code: "error_something_something" };

            moxios.install(axiosInstance);
            moxios.stubRequest('/', {
                status: 404,
                response: responseBody
            });

            try {
                await axiosInstance.get('/');
            } catch (e) {
                const response = fromAxiosError(e);
                expect(response.status).to.equal(404);
                expect(response.body).to.equal(JSON.stringify(responseBody));
                return
            }

            throw new Error('Should have failed');
        });


        it('Request error', async () => {
            try {
                await axios.get('/nonexistentpath');
            } catch (e) {
                const response = fromAxiosError(e);
                expect(response.status).to.equal(-1);
                expect(response.body).to.be.a('string');
                return
            }

            throw new Error('Should have failed');
        });
    });
}