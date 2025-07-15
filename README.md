# TimeBank - Microsoft Teams App

TimeBank is a Microsoft Teams application that allows team members to log time savings from using productivity tools, earn credits with multipliers, and redeem benefits.

**GitHub Repository**: https://github.com/akhilthomas236/time-bank

## Features

- 🕐 **Time Tracking**: Log time saved using productivity tools (ChatGPT, Copilot, etc.)
- 🏆 **Credit System**: Earn credits with multipliers based on the tools used
- 🎁 **Benefits**: Redeem credits for various benefits (Family Day Off, Professional Courses, etc.)
- 📊 **Analytics**: Track productivity improvements and visualize data
- 🔗 **SharePoint Integration**: Store data in SharePoint Lists for enterprise integration

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/akhilthomas236/time-bank.git
   cd time-bank
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run debug
   ```

4. Test bot commands locally:
   ```bash
   curl -X POST http://localhost:3007/api/messages \
     -H "Content-Type: application/json" \
     -d '{"type":"message","text":"help","from":{"id":"testUser","name":"Test User","aadObjectId":"testUserId"},"recipient":{"id":"bot","name":"TimeBank"},"conversation":{"id":"testConv"},"channelId":"msteams","serviceUrl":"https://smba.trafficmanager.net/amer/"}'
   ```

## Bot Commands

- `save <minutes> mins - <tool>` - Log time saved (e.g., "save 30 mins - ChatGPT")
- `balance` - Check your current credit balance
- `redeem` - View and redeem available benefits
- `history` - View your time saving history
- `help` - Show available commands and tools

## Getting started with Microsoft Teams Apps development

Head on over to [Microsoft Teams official documentation](https://developer.microsoft.com/en-us/microsoft-teams) to learn how to build Microsoft Teams Tabs or the [Microsoft Teams Yeoman generator docs](https://github.com/PnP/generator-teams/docs) for details on how this solution is set up.

## Project setup

All required source code are located in the `./src` folder:

* `client` client side code
* `server` server side code
* `public` static files for the web site
* `manifest` for the Microsoft Teams app manifest

For further details see the [Yo Teams documentation](https://github.com/PnP/generator-teams/docs)

## Building the app

The application is built using the `build` Gulp task.

``` bash
npm i -g gulp-cli
gulp build
```

## Building the manifest

To create the Microsoft Teams Apps manifest, run the `manifest` Gulp task. This will generate and validate the package and finally create the package (a zip file) in the `package` folder. The manifest will be validated against the schema and dynamically populated with values from the `.env` file.

``` bash
gulp manifest
```

## Deploying the manifest

Using the `yoteams-deploy` plugin, automatically added to the project, deployment of the manifest to the Teams App store can be done manually using `gulp tenant:deploy` or by passing the `--publish` flag to any of the `serve` tasks.

## Configuration

Configuration is stored in the `.env` file.

## Debug and test locally

To debug and test the solution locally you use the `serve` Gulp task. This will first build the app and then start a local web server on port 3007, where you can test your Tabs, Bots or other extensions. Also this command will rebuild the App if you change any file in the `/src` directory.

``` bash
gulp serve
```

To debug the code you can append the argument `debug` to the `serve` command as follows. This allows you to step through your code using your preferred code editor.

``` bash
gulp serve --debug
```

## Useful links

* [Debugging with Visual Studio Code](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/vscode.md)
* [Developing with ngrok](https://github.com/pnp/generator-teams/blob/master/docs/docs/concepts/ngrok.md)
* [Developing with Github Codespaces](https://github.com/pnp/generator-teams/blob/master/docs/docs/user-guide/codespaces.md)

## Additional build options

You can use the following flags for the `serve`, `ngrok-serve` and build commands:

* `--no-linting` or `-l` - skips the linting of Typescript during build to improve build times
* `--debug` - builds in debug mode and significantly improves build time with support for hot reloading of client side components
* `--env <filename>.env` - use an alternate set of environment files
* `--publish` - automatically publish the application to the Teams App store

## Deployment

The solution can be deployed to Azure using any deployment method.

* For Azure Devops see [How to deploy a Yo Teams generated project to Azure through Azure DevOps](https://www.wictorwilen.se/blog/deploying-yo-teams-and-node-apps/)
* For Docker containers, see the included `Dockerfile`

## Logging

To enable logging for the solution you need to add `msteams` to the `DEBUG` environment variable. See the [debug package](https://www.npmjs.com/package/debug) for more information. By default this setting is turned on in the `.env` file.

Example for Windows command line:

``` bash
SET DEBUG=msteams
```

If you are using Microsoft Azure to host your Microsoft Teams app, then you can add `DEBUG` as an Application Setting with the value of `msteams`.
