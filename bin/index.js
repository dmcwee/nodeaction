#!/usr/bin/env node

// read in env settings
require('dotenv').config();
const fs = require('fs/promises');

const yargs = require('yargs');
const fetch = require('./fetch');
const auth = require('./auth');
const policy = require('./configPolicy');
const file = require('./file')

const options = yargs
    .usage('Usage: --op <operation_name> --pid <policy_id>')
    .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
    .option('file', {alias: 'f', describe: 'input or output file', type: 'string', demandOption: false})
    .option('id', { alias: 'policyid', describe: 'policy id', type: 'string', demandOption: false })
    .option('uri', {alias: 'graphUri', describe: 'Graph Uri to Call', type: 'string', demandOption: false, default: null})
    .option('n', {alias: 'name', describe: 'policy name', type: 'string', demandOption: false, default: null})
    .argv;

async function list(uri, accessToken) {
    try {
        const result = await fetch.list(uri, accessToken);
        if(options.file != null) {
            await file.writeFile(result, options.file);
        }
        else {
            console.log(JSON.stringify(result, undefined, 2));
        }
    }
    catch(error) {
        console.log(error);
    }
}

async function main() {
    console.log(`You have selected: ${options.op}`);

    // here we get an access token
    const authResponse = await auth.getToken(auth.tokenRequest);

    switch (options.op) {
        case 'getUsers':
            list(auth.apiConfig.uri, authResponse.accessToken);
            break;
        case 'fileTesting':
            try {
                const filePath = options.file;
                const files = await fs.readdir(filePath);
                for(let file of files){
                    console.log(`Opening file ${filePath}/${file}`);
                    const fileContent = await fs.readFile(`${filePath}/${file}`);
                    console.log(`File Content: ${fileContent}`);
                }
            }
            catch (error) {
                console.log(error);
            }
            break;
        case 'list':
            list(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken);
            break;
        case 'newPolicy':
            try {
                const policy = JSON.parse(await file.readFile(options.file));
                policy['name'] = options.name;

                const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, policy);
                console.log(`Result: ${JSON.stringify(result, undefined, 2)}`);
            }
            catch(error) {
                console.log(error);
            }
            break;
        case 'updatePolicy':
            try {
                const policy = JSON.parse(await file.readFile(options.file));
                policy['name'] = options.name;

                const result = await fetch.update(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, policy);
                console.log(`Result: ${JSON.stringify(result, undefined, 2)}`);
            }
            catch(error) {
                console.log(error);
            }
            break;
        case 'configurationPoliciesSettings':
            list(auth.apiConfig.deviceManagement.configurationPoliciesSettings(options.id), authResponse.accessToken);
            break;
        case 'configurationPolicyTemplateSettings':
            list(auth.apiConfig.deviceManagement.configurationPolicyTemplateSettings(options.id), authResponse.accessToken);
            break;
        case 'configurationPolicyTemplatesFiltered':
            list(auth.apiConfig.deviceManagement.configurationPolicyTemplatesFiltered(options.id), authResponse.accessToken);
            break;
        case 'configurationPolicies':
        case 'reusableSettings':
        case 'inventorySettings':
        case 'complianceSettings':
        case 'configurationSettings':
        case 'templates':
        case 'configurationPolicyTemplates':
        case 'configurationCategories':
            list(auth.apiConfig.deviceManagement[options.op], authResponse.accessToken);
            break;
        case 'securityPolicies':
            list(auth.apiConfig.securityPolicies.supportedTemplates, authResponse.accessToken);
            break;
        default:
            console.log('Select a Graph operation first');
            break;
    }
};

main();