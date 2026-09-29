const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { test } = require('node:test');
const api = require('../bin/fetch');

test('MSAL authenticates with the existing client-secret configuration and caches the token', async (t) => {
    const tenant = '11111111-1111-4111-8111-111111111111';
    const authority = `https://login.microsoftonline.com/${tenant}`;
    const environment = {
        CLIENT_ID: '22222222-2222-4222-8222-222222222222',
        CLIENT_SECRET: 'offline-test-secret',
        TENANT_ID: tenant,
        AAD_ENDPOINT: 'https://login.microsoftonline.com',
        GRAPH_ENDPOINT: 'https://graph.microsoft.com'
    };
    const previous = {};
    for (const [key, value] of Object.entries(environment)) {
        previous[key] = process.env[key];
        process.env[key] = value;
    }
    t.after(() => {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
        delete require.cache[require.resolve('../bin/auth')];
    });

    const tokenRequests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        const requestUrl = new URL(url);
        const endpoint = `${requestUrl.origin}${requestUrl.pathname}`;
        if (endpoint === `${authority}/v2.0/.well-known/openid-configuration`) {
            return Response.json({
                authorization_endpoint: `${authority}/oauth2/v2.0/authorize`,
                token_endpoint: `${authority}/oauth2/v2.0/token`,
                end_session_endpoint: `${authority}/oauth2/v2.0/logout`,
                issuer: `${authority}/v2.0`,
                jwks_uri: `${authority}/discovery/v2.0/keys`
            });
        }
        assert.equal(endpoint, `${authority}/oauth2/v2.0/token`);
        assert.match(requestUrl.searchParams.get('client-request-id'), /^[0-9a-f-]{36}$/);
        assert.equal(options.method, 'POST');
        tokenRequests.push(new URLSearchParams(options.body));
        return Response.json({
            token_type: 'Bearer',
            access_token: 'offline-test-access-token',
            expires_in: 3600,
            ext_expires_in: 3600
        });
    });

    const auth = require('../bin/auth');
    const result = await auth.getToken(auth.tokenRequest);
    assert.equal(result.accessToken, 'offline-test-access-token');
    assert.equal(tokenRequests.length, 1);
    assert.equal(tokenRequests[0].get('grant_type'), 'client_credentials');
    assert.equal(tokenRequests[0].get('client_id'), environment.CLIENT_ID);
    assert.equal(tokenRequests[0].get('client_secret'), environment.CLIENT_SECRET);
    assert.ok(tokenRequests[0].get('scope').split(' ').includes('https://graph.microsoft.com/.default'));
    const cached = await auth.getToken(auth.tokenRequest);
    assert.equal(cached.accessToken, result.accessToken);
    assert.equal(tokenRequests.length, 1);
});

test('Axios preserves Graph helper JSON payloads, bearer headers and same-origin redirects', async (t) => {
    const server = http.createServer(async (request, response) => {
        if (request.url === '/redirect') {
            response.writeHead(302, { Location: '/policies' });
            response.end();
            return;
        }
        let body = '';
        for await (const chunk of request) body += chunk;
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            method: request.method,
            authorization: request.headers.authorization,
            body: body ? JSON.parse(body) : null
        }));
    });
    t.after(() => new Promise((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => error ? reject(error) : resolve());
    }));
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const endpoint = `http://127.0.0.1:${server.address().port}`;
    const token = 'offline-test-token';
    const body = { name: 'Test policy', settings: [{ value: 'enabled' }] };
    for (const [method, invoke, expectedBody] of [
        ['GET', () => api.get(`${endpoint}/policies`, token), null],
        ['GET', () => api.list(`${endpoint}/redirect`, token), null],
        ['POST', () => api.create(`${endpoint}/policies`, token, body), body],
        ['PUT', () => api.update(`${endpoint}/policies`, token, body), body]
    ]) {
        assert.deepEqual(await invoke(), {
            method,
            authorization: `Bearer ${token}`,
            body: expectedBody
        });
    }
});
