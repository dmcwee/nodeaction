#!/usr/bin/env node

// read in env settings
require('dotenv').config();

const yargs = require('yargs');
const fetch = require('./fetch');
const auth = require('./auth');
const policy = require('./configPolicy');
const file = require('./file')

const options = yargs
    .usage('Usage: --op <operation_name> --pid <policy_id>')
    .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
    .option('id', { alias: 'policyid', describe: 'policy id', type: 'string', demandOption: false })
    .option('o', {alias: 'output', describe: 'output file name', type: 'string', demandOption: false, default: null})
    .option('name')
    .argv;

async function main() {
    console.log(`You have selected: ${options.op}`);

    // here we get an access token
    const authResponse = await auth.getToken(auth.tokenRequest);

    switch (yargs.argv['op']) {
        case 'getUsers':
            try {
                // call the web API with the access token
                const users = await fetch.list(auth.apiConfig.uri, authResponse.accessToken);
                if(options.o != null) {
                    file.writeFile(users, options.o)
                }
                else {
                    // display result
                    console.log(users);
                }
            } catch (error) {
                console.log(error);
            }
            break;
        case 'newConfigurationPolicies':
                try {
                    const p = policy.newConfigurationPolicy(options.name);
                    const result = await fetch.create(auth.apiConfig.deviceManagement.configurationPolicies, authResponse.accessToken, p);
                    console.log(result);
                }
                catch(error) {
                    console.log(error);
                }
                break;
        case 'configurationPoliciesSettings':
                    try {
                        const settings = await fetch.list(auth.apiConfig.deviceManagement.configurationPoliciesSettings(options.id), authResponse.accessToken);
                        if(options.o != null) {
                            file.writeFile(settings, options.o)
                        }
                        else {
                            console.log(JSON.stringify(settings, undefined, 2));
                        }
                    }
                    catch(error) {
                        console.log(error);
                    }
                    break;
        case 'configurationPolicies':
        case 'reusableSettings':
        case 'inventorySettings':
        case 'complianceSettings':
        case 'configurationSettings':
            try {
                const policies = await fetch.list(auth.apiConfig.deviceManagement[options.op], authResponse.accessToken);
                if(options.o != null) {
                    file.writeFile(policies, options.o)
                }
                else {
                    console.log(policies);
                }
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