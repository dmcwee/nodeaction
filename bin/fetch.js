const axios = require('axios');

/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint
 * @param {string} accessToken
 */
async function callApi(endpoint, accessToken, action, body) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`${action} request made to web API (${endpoint}) at: ${new Date().toString()}`);

    switch(action) {
        case 'get':
            return axios.get(endpoint, options);
        break;
        case 'post':
            return axios.post(endpoint, body, options);
        break;
        case 'delete':
            return axios.delete(endpoint, body, options);
        break;
        default:
            throw "Invalid graphApi Action"
        break;
    }
}

async function create(endpoint, accessToken, body) {
    try {
        const response = await callApi(endpoint, accessToken, 'post', body)
        return response.data
    }
    catch (error) {
        console.log(error);
        return error;
    }
};

async function get(endpoint, accessToken) {
    try {
        const response = await callApi(endpoint, accessToken, 'get', null)
        return response.data
    }
    catch (error) {
        console.log(error);
        return error;
    } 
};

async function del(endpoint, accessToken) {
    try {
        const response = await callApi(endpoint, accessToken, 'delete', null)
        return response.data
    }
    catch (error) {
        console.log(error);
        return error;
    } 
}

async function list(endpoint, accessToken) {
    try {
        const response = await callApi(endpoint, accessToken, 'get', null);
        return response.data;
    } catch (error) {
        console.log(error)
        return error;
    }
};

module.exports = {
    list: list,
    create: create,
    get: get,
    del: del
};