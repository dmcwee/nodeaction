# NodeAction

This project provides a way to interact with the Device Configuration v2 endpoints which are used to create and manage MDE Security Policies.

## Prerequisites 

* NodeJS
* Microsoft M365 Tenant with license for Device Control (Intune or MDE)
* Ability to register and application in Entra ID

## Setup

1. Clone or copy the project to your local system
1. Create an application regisration in your Entra ID Tenant
1. Generate an application secret
1. Grant the application Microsoft Graph permissions:
    1. `DeviceManagementConfiguration.Read.All` if you only want to export from your tenant
    1. `DeviceManagementConfiguration.ReadWrite.All` if you want to export and create/import device configuration policies
1. Copy `.env.template` to `.env` and update the **Tenant ID**, **Client ID**, and **Client Secret** values to match those of your application registration.
1. Install dependencies
  1. Run `npm ci`

> [Entra Application Registration Instrution](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app?tabs=client-secret)

## Run

There are two primary actions for NodeActions: **import** and **export**.

### Export

The export command will extract all Device Configuration Policies and write them to the specified folder. Each policy found will generate a new file with the format `policy_{policy's GUID}.json`. The format of these exported policies are aligned with the format necessary to import the policy into another tenant.

```shell
> node . --op export -p ./exports

> node . --op export -p ./exports --id POLICY_GUID
```

### Import

The import command, if provided a folder path, will iterate through the child files and attempt to import them into the tenant. If the import command is provided the path to a single file then only that policy file will be imported. 

```shell
> node . --op import -p ./policies

> node . --op import -p ./policies/deviceControlPolicy.json
```
