# Vantiva Chargeback App

This project contains a Forge app written in JavaScript/Typescript that generates Invoices and SAP data for chargeback cloud.

## Requirements

- Install node.js :
  - Windows : [MSI Installer](https://nodejs.org/dist/v24.15.0/node-v24.15.0-x64.msi)
  - Linux :

  ```
  # Download and install nvm:
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

  # in lieu of restarting the shell
  \. "$HOME/.nvm/nvm.sh"

  # Download and install Node.js:
  nvm install 24

  # Verify the Node.js version:
  node -v # Should print "v24.15.0".

  # Verify npm version:
  npm -v # Should print "11.12.1".
  ```

- Install Forge (from terminal) : `npm install -g @forge/cli`

- Test forge installation : `forge --version`

- Create in root folder .env file with an Atlassian personnal email and token :

  ```
  FORGE_EMAIL=<Atlassian Email>
  FORGE_API_TOKEN=<Atlassian Personnal Token>

  export FORGE_EMAIL FORGE_API_TOKEN
  ```

  > Note that the account used must be admin of the app, see [Developper console](https://developer.atlassian.com/console/myapps/d582aaea-0710-4e4b-9318-33caee783d33/overview)

- Load the two variables using (will have to be called each time Terminal or VSCode is restarted):
  - Linux : `. .env`
  - Windows : `.\env.ps1`

- Test forge connection : `forge whoami`

- Install Dependencies : `npm install`

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) more details.

## Forge commands

- Build and deploy your app by running (will send updated app to Forge platform, automatically updating any installation of the app):
  - Development environment : `forge deploy`
  - Production environment : `forge deploy -e production`

- Install your app in an Atlassian site by running:
  - Development : `forge install`
  - Prodcution : `forge install -e production`

- Develop your app by running `forge tunnel` to proxy invocations locally (only with development environment): `forge tunnel`

### Notes

- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Resources

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.
