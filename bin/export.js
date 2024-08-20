const fetch = require('./fetch');

async function convertToConfigurationPolicy(policy, settings) {
    console.debug(`settings length: ${settings.value.length}`);

    let settingsArray = await convertToPolicySettings(settings);
    console.log(`settingsArray length: ${settingsArray.length}`);

    return {
        description: policy.description,
        name: policy.name,
        platforms: policy.platforms,
        technologies: policy.technologies,
        templateReference: {
            templateId: policy.templateReference.templateId
        },
        settings: settingsArray
    }
}

async function convertToPolicySettings(settings) {
    policySettingsList = [];
    for(let setting of settings.value){
        policySettingsList.push(setting.settingInstance);
    }
    console.log(`returning array with length ${policySettingsList.length}`);
    return policySettingsList;
}

async function exportConfigurationPolicy(policyId, token) {
    var policy = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policyId}`, token);
    var settings = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policyId}/settings`, token);

    return await convertToConfigurationPolicy(policy, settings);
}

async function exportConfigurationPolicies(token) {
    var policies = new Map();
    
    var policyList = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies`, token);
    for(let policy of policyList.value){
        var setting = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policy.id}/settings`, token);
        policies.set(policy.id, await convertToConfigurationPolicy(policy, setting));
    }
    return policies;
}

module.exports = {
    exportConfigurationPolicies,
    exportConfigurationPolicy
}