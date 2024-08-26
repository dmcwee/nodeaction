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

**Command Line:** `node . --op export -f ./exports` will export all policies and their associated settings.

**Command Line:** `node . --op export -f ./exports --id POLICY_GUID` will export only the policy with the matching GUID

### Import

**Command Line:** `node . --op import -f ./policies` will import all policies in the policy folder.

**Command Line:** `node . --op import -f ./policies/deviceControlPolicy.json` will only import the policy from the `deviceControlPolicy.json` file.

### Usage

**Usage:** --op [import, export] -f <file/folder path>

**Options:**
      --help             Show help
      --version          Show version number
      --op, --operation  operation name
  -f, --file             file or filepath
      --id, --policyid   policy id
      --uri, --graphUri  Graph Uri to Call
  -n, --name             policy name