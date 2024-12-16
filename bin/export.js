const fetch = require('./fetch');

function convertToConfigurationPolicy(policy, settings) {
    let settingsArray = convertToPolicySettings(settings);

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

function createSettingValueTemplateReference(settingValueTemplateReference) {
    if(settingValueTemplateReference !== null) {
        return {
            settingValueTemplateId: settingValueTemplateReference.settingValueTemplateId
        };
    }
    else {
        return null;
    }
}

function createChoiceSettingValue(settings) {
    //console.log(`settings: ${JSON.stringify(settings)}`);
    return {
        "@odata.type": "#microsoft.graph.deviceManagementConfigurationSetting",
        "settingInstance": {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
            "choiceSettingValue": {
                "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                children: settings.settingInstance.choiceSettingValue.children,
                settingValueTemplateReference: createSettingValueTemplateReference(settings.settingInstance.choiceSettingValue.settingValueTemplateReference),
                value: settings.settingInstance.choiceSettingValue.value
            },
            "settingDefinitionId": settings.settingInstance.settingDefinitionId,
            "settingInstanceTemplateReference": settings.settingInstance.settingInstanceTemplateReference
        }
    };
}

function createSimpleSettingInstance(settings) {
    // console.log(`simple settings: ${JSON.stringify(settings)}`);
    return {
        "id": settings.id,
        "settingInstance": settings.settingInstance
    };
}

function convertToPolicySettings(settings) {
    policySettingsList = [];
    for(let setting of settings.value){
        if(setting.settingInstance["@odata.type"] === "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance") {
            policySettingsList.push(createChoiceSettingValue(setting));
        }
        else if(setting.settingInstance["@odata.type"] === "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance" ||
            setting.settingInstance["@odata.type"] === "#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance" ||
            setting.settingInstance["@odata.type"] === "#microsoft.graph.deviceManagementConfigurationSimpleSettingCollectionInstance"
        ) {
            policySettingsList.push(createSimpleSettingInstance(setting));
        }
        else {
            policySettingsList.push(setting.settingInstance);
        }
    }
    //console.log(`returning array with length ${policySettingsList.length}`);
    return policySettingsList;
}

function exportRawConfigPolicy(policy, settings, error) {
    return {
        rawPolicy: policy,
        rawSettings: settings,
        exception: error
    };
}

async function exportConfigurationPolicy(policyId, token) {
    var policy = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policyId}`, token);
    var settings = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policyId}/settings`, token);

    return convertToConfigurationPolicy(policy, settings);
}

async function exportConfigurationPolicies(token) {
    var policies = new Map();
    
    var policyList = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies`, token);
    for(let policy of policyList.value){
        var setting = await fetch.get(`${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policy.id}/settings`, token);
        try {
            policies.set(policy.id, convertToConfigurationPolicy(policy, setting));
        }
        catch(error) {
            console.error(`Ran into an issue exporting policy ${policy.id}. Adding raw export. Error: ${error}`);
            policies.set(policy.id, exportRawConfigPolicy(policy, setting, error));
        }
    }
    return policies;
}

module.exports = {
    exportConfigurationPolicies,
    exportConfigurationPolicy
}