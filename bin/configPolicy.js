function newConfigurationPolicy(name) {
    return {
        "description": "",
        "name": name,
        "platforms": "linux",
        "settings": [
            {
            "@odata.type": "#microsoft.graph.deviceManagementConfigurationSetting",
            "settingInstance": {
                "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
                "choiceSettingValue": {
                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                    "children": [],
                    "settingValueTemplateReference": {
                        "settingValueTemplateId": "f43ea7cb-baa1-4c05-87a7-b11e0c94becc"
                    },
                    "value": "linux_mdatp_managed_cloudservice_enabled_true"
                    },
                "settingDefinitionId": "linux_mdatp_managed_cloudservice_enabled",
                "settingInstanceTemplateReference": {
                    "settingInstanceTemplateId": "ad8554ce-16d5-44a5-9686-d286844755b0"
                    }
                }
            }
        ],
        "technologies": "microsoftSense",
        "templateReference": {
            "templateId": "4cfd164c-5e8a-4ea9-b15d-9aa71e4ffff4_1"
        }
    }
}

module.exports = {
    newConfigurationPolicy: newConfigurationPolicy
};