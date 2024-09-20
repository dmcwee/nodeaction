const fetch = require('./fetch');

async function convertToConfigurationPolicy(policy, settings) {
    console.debug(`settings length: ${settings.value.length}`);

    let settingsArray = await convertToPolicySettings(settings);
    console.log(`settingsArray length: ${settingsArray.length}`);

    return {
        name: policy.name,
        description: policy.description,
        settings: settingsArray,
        roleScopeTagIds:["0"],
        platforms: policy.platforms,
        technologies: policy.technologies,
        templateReference: {
            templateId: policy.templateReference.templateId
        },
    }
}

async function createChoiceSettingValue(settings) {
    //console.log(`settings: ${JSON.stringify(settings)}`);
    return {
        "@odata.type": "#microsoft.graph.deviceManagementConfigurationSetting",
        "settingInstance": {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
            "choiceSettingValue": {
                "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                children: settings.settingInstance.choiceSettingValue.children,
                settingValueTemplateReference: {
                    settingValueTemplateId: settings.settingInstance.choiceSettingValue.settingValueTemplateReference.settingValueTemplateId
                },
                value: settings.settingInstance.choiceSettingValue.value
            },
            "settingDefinitionId": settings.settingInstance.settingDefinitionId,
            "settingInstanceTemplateReference": settings.settingInstance.settingInstanceTemplateReference
        }
    };
}

async function convertToPolicySettings(settings) {
    policySettingsList = [];
    for(let setting of settings.value){
        if(setting.settingInstance["@odata.type"] === "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance") {
            policySettingsList.push(await createChoiceSettingValue(setting));
        }
        else {
            policySettingsList.push(setting.settingInstance);
        }
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