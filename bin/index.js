#!/usr/bin/env node

// read in env settings
require('dotenv').config();

const yargs = require('yargs');
const fetch = require('./fetch');
const auth = require('./auth');
const file = require('./file')
const exporter = require('./export')

const options = yargs
    .usage('Usage: --op [import, export] -f <file or folder path> ')
    .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
    .option('p', {alias: 'path', describe: 'file or filepath', type: 'string', demandOption: false})
    .option('id', { alias: 'policyid', describe: 'policy id', type: 'string', demandOption: false })
    .option('uri', {alias: 'graphUri', describe: 'Graph Uri to Call', type: 'string', demandOption: false, default: "beta/deviceManagement/configurationPolicies"})
    .option('n', {alias: 'name', describe: 'policy name', type: 'string', demandOption: false, default: null})
    .argv;

async function list(uri, accessToken) {
    try {
        //console.debug(`DEBUG Options: ${JSON.stringify(options)}`);

        const result = await fetch.list(uri, accessToken);
        if(options.p) {
            await file.writeFile(result, options.p);
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
        case 'test':
            console.log("Test Run");
            const policies = list(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies`, authResponse.accessToken);
            console.log(`Received ${policies.value.count} policies from the tenant.`);
            break;
        case 'fileTesting':
            file.test(options.p);
            break;
        case 'list':
            list(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken);
            break;
        case 'export':
            try {
                if(options.id){
                    const filePath = `${options.p}/policy_${options.id}.json`;
                    const policy = await exporter.exportConfigurationPolicy(options.id, authResponse.accessToken);
                    file.writeFile(policy, filePath);
                }
                else {
                    const policies = await exporter.exportConfigurationPolicies(authResponse.accessToken);
                    policies.forEach((policy, key) => {
                        var exportFile = `${options.p}/policy_${key}.json`;
                        file.writeFile(policy, exportFile)
                    });
                }
            }
            catch(error) {
                console.error(error);
            }
            break;
        case 'import':
            try {
                const isFolder = await file.isFolder(options.p);
                if(isFolder){
                    const files = await file.readDir(options.p);
                    for(let policyfile of files){
                        const fileContent = JSON.parse(await file.readFile(`${options.p}/${policyfile}`));
                        //console.log(`File Content: ${fileContent}`);
                        const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, fileContent);
                        await file.writeFile(result, `${options.p}/${policyfile}.result`);
                    }
                }
                else {
                    const content = JSON.parse(await file.readFile(options.p));
                    const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, content);
                    await file.writeFile(result, `${options.p}.result`);
                }
            }
            catch(error) {
                //console.error(error);
            }
            break;
        case 'new':
            try {
                const policy = JSON.parse(await file.readFile(options.p));
                policy['name'] = options.name;

                const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, policy);
                console.log(`Result: ${JSON.stringify(result, undefined, 2)}`);
            }
            catch(error) {
                console.error(error);
            }
            break;
        case 'update':
            try {
                const policy = JSON.parse(await file.readFile(options.p));
                policy['name'] = options.name;

                const result = await fetch.update(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, policy);
                console.log(`Result: ${JSON.stringify(result, undefined, 2)}`);
            }
            catch(error) {
                console.error(error);
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