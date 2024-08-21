#!/usr/bin/env node

// read in env settings
require('dotenv').config();

const yargs = require('yargs');
const fetch = require('./fetch');
const auth = require('./auth');
//const policy = require('./configPolicy');
const file = require('./file')
const exporter = require('./export')

const options = yargs
    .usage('Usage: --op [import, export] --id <policy_guid> ')
    .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
    .option('f', {alias: 'file', describe: 'file or filepath', type: 'string', demandOption: false})
    .option('id', { alias: 'policyid', describe: 'policy id', type: 'string', demandOption: false })
    .option('uri', {alias: 'graphUri', describe: 'Graph Uri to Call', type: 'string', demandOption: false, default: "/beta/deviceManagement/configurationPolicies"})
    .option('n', {alias: 'name', describe: 'policy name', type: 'string', demandOption: false, default: null})
    .argv;

async function list(uri, accessToken) {
    try {
        console.debug(`Options: ${JSON.stringify(options)}`);

        const result = await fetch.list(uri, accessToken);
        if(options.f) {
            await file.writeFile(result, options.f);
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
            break;
        case 'fileTesting':
            file.test(options.f);
            break;
        case 'list':
            list(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken);
            break;
        case 'export':
            try {
                if(options.id){
                    const filePath = `${options.f}/policy_${options.id}.json`;
                    const policy = await exporter.exportConfigurationPolicy(options.id, authResponse.accessToken);
                    file.writeFile(policy, filePath);
                }
                else {
                    const policies = await exporter.exportConfigurationPolicies(authResponse.accessToken);
                    policies.forEach((policy, key) => {
                        var exportFile = `${options.f}/policy_${key}.json`;
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
                const isFolder = file.isFolder(options.f);
                if(isFolder){
                    const files = await fs.readdir(path);
                    for(let file of files){
                        const fileContent = await fs.readFile(`${path}/${file}`);
                        const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, fileContent);
                        await file.writeFile(result, `${path}/${file}.result`);
                    }
                }
                else {
                    const content = JSON.parse(await file.readFile(options.f));
                    const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, content);
                    await file.writeFile(result, `${options.f}.result`);
                }
            }
            catch(error) {
                console.error(error);
            }
            break;
        case 'newPolicy':
            try {
                const policy = JSON.parse(await file.readFile(options.f));
                policy['name'] = options.name;

                const result = await fetch.create(`${process.env.GRAPH_ENDPOINT}/${options.uri}`, authResponse.accessToken, policy);
                console.log(`Result: ${JSON.stringify(result, undefined, 2)}`);
            }
            catch(error) {
                console.error(error);
            }
            break;
        case 'updatePolicy':
            try {
                const policy = JSON.parse(await file.readFile(options.f));
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