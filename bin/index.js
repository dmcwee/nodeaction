#!/usr/bin/env node

// read in env settings
require('dotenv').config();

const yargs = require('yargs');
const fetch = require('./fetch');
const msal = require('@azure/msal-node');
// const auth = require('./auth');

const options = yargs
    .usage('Usage: --op <operation_name> --cid <client_id> --secret <client_secret>')
    .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
    .option('tid', { alias: 'tenant_id', describe: 'tenant id', type: 'string', demandOption: false, default: process.env.TENANT_ID})
    .option('cid', { alias: 'client_id', describe: 'application client id in your tenant', type: 'string', demandOption: false, default: process.env.CLIENT_ID})
    .option('secret', { alias: 'client_secret', describe: 'application secret in your tenant', type:'string', demandOption: false, default: process.env.CLIENT_SECRET})
    .option('graph', { alias: 'graphapi', describe: 'graph api to call', type:'string', demandOption: false, default:'https://graph.microsoft.com/'})
    .option('aad', { alias: 'aadendpoint', describe: 'aad login endpoint', type:'string', demandOption: false, default: 'https://login.microsoftonline.com/'})
    .argv;

async function main() {
    console.log(`You have selected: ${options.op}`);

    const tokenRequest = {
        scopes: [`${yargs.argv['graph']}/.default`],
    };
    console.log(`tokenRequest scope: ${ JSON.stringify(tokenRequest.scopes) }`);

    const apiConfig = {
        uri: yargs.argv['graph'] + '/v1.0/users',
    };
    console.log(`apiConfig.uri: ${ JSON.stringify(apiConfig.uri) }`);

    const msalConfig = {
        auth: {
            clientId: yargs.argv['cid'],
            authority: yargs.argv['aad'] + yargs.argv['tid'],
            clientSecret: yargs.argv['secret'],
        }
    };
    console.log(`msalConfig: ${ JSON.stringify(msalConfig.auth) }`);
    const cca = new msal.ConfidentialClientApplication(msalConfig);

    switch (yargs.argv['op']) {
        case 'getUsers':

            try {
                // here we get an access token
                //const authResponse = await auth.getToken(auth.tokenRequest);
                const authResponse = await cca.acquireTokenByClientCredential(tokenRequest);

                // call the web API with the access token
                const users = await fetch.callApi(apiConfig.uri, authResponse.accessToken);

                // display result
                console.log(users);
            } catch (error) {
                console.log(error);
            }

            break;
        case 'getConfigPolicies':
            try {
                const authResponse = await auth.getToken(tokenRequest);
                const policies = await fetch.callApi(yargs.argv['graph'] + 'beta/deviceManagement/configurationPolicies', authResponse.accessToken);
                console.log(policies);
            }
            catch(error) {
                console.log(error);
            }
            break;
        default:
            console.log('Select a Graph operation first');
            break;
    }
};

main();