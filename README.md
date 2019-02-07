# digital-oracles-prototype

#### Contents

The project contains the following:

* Smart Contracts located in `./contracts`
* Smart Contract tests located in `./test`
* Smart Contract migrations `./migrations`
* Serverless API located in `./functions`
    * Note this has its own `node_modules` and `package.json` different from the root project

#### Installation

* Requires the following tools to run locally
    * **node JS 8+**
    * **truffle 5+** - https://truffleframework.com
    * **ganache 1.4+** - https://truffleframework.com/ganache
    
* Once installed:
    * `npm install` - install all dependencies
    * `npm run test` - runs all truffle tests
    * `./run_app.sh` - starts up the API
    * `./firebase_deploy.sh` - deploys the app to live (permission will need to be granted)
    * `./clean_deploy_local.sh` - will deploy all contracts to your local blockchain

* Running everything locally
    * Start up `ganache`
    * Install contracts `./clean_deploy_local.sh`
    * Once installed you will need to update two pieces of information
        * Copy the private key from your local `Ganache` account to `./functions/api/web3/privateKey.js`
        * ensure that the deployed contract address is correct - updating it here `./functions/api/web3/network.js` 
    * Start the API `./run_app.sh`
