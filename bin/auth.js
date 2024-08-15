const msal = require('@azure/msal-node');

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: process.env.AAD_ENDPOINT + '/' + process.env.TENANT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://learn.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const tokenRequest = {
    scopes: [process.env.GRAPH_ENDPOINT + '/.default'],
};

const apiConfig = {
    uri: `${process.env.GRAPH_ENDPOINT}/v1.0/users`,
    deviceManagement: {
        configurationPolicies: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies`,  //policies created in the tenant. Add ('id') and send a put request to update the policy
        configurationPoliciesSettings: function(policyId) {
            return `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicies/${policyId}/settings`;
        },
        configurationPolicyTemplates: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicyTemplates`,
        configurationPolicyTemplatesFiltered: function(templateId) {
            return `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicyTemplates('${templateId}')`;
        },
        configurationPolicyTemplateSettings: function(templateId){
            return `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationPolicyTemplates('${templateId}')/settingTemplates?$expand=settingDefinitions`
        },
        configurationCategories: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationCategories?templateCategory=True`,
        reusableSettings: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/reusableSettings`,
        inventorySettings: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/inventorySettings`, //invalid
        complianceSettings: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/complianceSettings`,
        configurationSettings: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/configurationSettings`,
        templates: `${process.env.GRAPH_ENDPOINT}/beta/deviceManagement/templates`,
    },
    securityPolicies: {
        list: `${process.env.GRAPH_ENDPOINT}/beta/securityPolicies`, // invalid
        supportedTemplates: `${process.env.GRAPH_ENDPOINT}/beta/securityPolicies/supportedTemplates?implementationType=DcV2` //invalid
    }
};

/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest
 */
async function getToken(tokenRequest) {
    return await cca.acquireTokenByClientCredential(tokenRequest);
}

module.exports = {
    apiConfig: apiConfig,
    tokenRequest: tokenRequest,
    getToken: getToken
};