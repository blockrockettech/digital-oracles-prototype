# digital-oracles-prototype

## Contents

The project contains the following:

* Smart Contracts located in `./contracts`
* Smart Contract tests located in `./test`
* Smart Contract migrations `./migrations`
* Serverless API located in `./functions`
    * Note this has its own `node_modules` and `package.json` different from the root project
* Postman API collection can be imported from `DigitalOracles.postman_collection.json` 

## Installation

* Requires the following tools to run locally
    * **Node JS 8+**
    * **truffle 5+** - https://truffleframework.com
    * **ganache 1.3+** - https://truffleframework.com/ganache
    * **firebase tools** - `npm install -g firebase-tools`
    
* Once installed:
    * `npm install` - install all dependencies
    * `npm run test` - runs all truffle tests
    * `npm run coverage` - runs code coverage over the smart contracts
    * `./run_app.sh` - starts up the API **(you may need to run `firebase login` if its yours first time using firebase)** - more details here https://firebase.google.com/docs/cli/
    * `./firebase_deploy.sh` - deploys the app to live **(permission will need to be granted)**
    * `./clean_deploy_local.sh` - will deploy all contracts to your local blockchain

* Running everything locally
    * Start up `ganache`
    * Install contracts `./clean_deploy_local.sh`
    * Once installed you will need to update two pieces of information
        * Copy the private key from your local `Ganache` account to `./functions/api/web3/privateKey.js`
        * ensure that the deployed contract address is correct - updating it here `./functions/api/web3/network.js` 
    * Start the API `./run_app.sh` **(permission will need to be granted in order to run the app under the same project name)**

## SmartContract Design

* The smart contract is a simple source of truth for when two parties agree on the state of a contractual agreement
* The contract simply holds the state in the form of IDs, **with the assumption that IDs are numerical values**.

## API Design

* By design the API is stateless and proxies all calls to an Ethereum based blockchain

* All calls required the the `network` you are running against to be specified e.g.
    * `5777` = local
    * `3` = ropsten
    * For all `GET` requests this is part of the URL `/network/{networkId}`
    * For all `POST` requests this must be specified as part of the body payload as the property `network`

* When making an API call you must follow this pattern:
    * Post data to API to endpoint which will change the contract state
        * e.g. `POST /api/contracts/create` with body 
            ```json
            {
                "network": 3,
                "contractId": 2,
                "partyA": 1
            }    
            ```
    * The API then submits the txs and returns a blob such as this:
    ```json
    {
        "success": true,
        "address": "0xae7FD5f460ff90fDCB86963De4c3ddDd237614aD",
        "network": 3,
        "transactionHash": "0x44cf9a40cd11a241da5f52b23602d90a6e8463e5aebf3ba6635f63af2e55bb8b"
    }
    ```
    * The calling service will then need to poll this endpoint every 5-10 seconds `/api/chain/{the_network_being_used}/{the_transactionHash_above}/receipt`
    * This will return a blob such as this:
    ```json
    {
        "blockHash": "0xb886859dc137efb8b8b0157840aae1be5b45a85ffdf8f13c0042e87ed9c9684b",
        "blockNumber": 4972704,
        "contractAddress": null,
        "cumulativeGasUsed": "0x336d0",
        "from": "0x0df0cC6576Ed17ba870D6FC271E20601e3eE176e",
        "gasUsed": "0x1c497",
        "logs": [],
        "logsBloom": "0x04000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000004000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000008000000000000000000000000000000000100000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000001000000000008000000000000000000000",
        "status": "0x1", <- the important bit
        "to": "0xae7FD5f460ff90fDCB86963De4c3ddDd237614aD",
        "transactionHash": "0x44cf9a40cd11a241da5f52b23602d90a6e8463e5aebf3ba6635f63af2e55bb8b",
        "transactionIndex": 3
    }
    ```
    * The `success` field is the property which needs to be checked
      * `success` can be `true` or `false` depending on the outcome of the call
         * Under the hood this looks at two properties, `status` and the presence of `blockNumber`
    * The calling application will need to stack up txs and process them sequentially
    * This post -> poll -> success/fail process is as the blockchain is async and there is no guarantee when or if the txs will be included in a block

* The best way to see what API functions exist is to view the postman collection at the root of the project

### API Hosts

* local: [http://localhost:5000/digital-oracles/us-central1](http://localhost:5000/digital-oracles/us-central1)
* deployed: [https://us-central1-digital-oracles.cloudfunctions.net](https://us-central1-digital-oracles.cloudfunctions.net)

### Deployed Contracts
* (Ropsten) https://ropsten.etherscan.io/address/0xae7fd5f460ff90fdcb86963de4c3dddd237614ad

### GAS Limits and Constraints
* Each transaction will get the latest standard GAS price, if this reaches above the value in `functions/const.js` - `MAX_GAS_PRICE` the txs will not be submit and an error will be returned from the service 

### Network IDs

* Networks are as follows:

|  Network | ID  |
|---|---|
| local  |  5777 |
| ropsten | 3 |
| rinkeby  | 4 |
| mainnet  | 1 |

### Sample Request

##### Creating a new contract

`POST https://us-central1-digital-oracles.cloudfunctions.net/api/contracts/create`

* `BODY`

```json
{
    "network": 3,
    "contractId": 1,
    "startDate": 0,
    "endDate": 0,
    "partyA": 1,
    "partyB": 1,
    "contractData": "ipfs-1234-abc-hash",
    "duration": "FixedTerm",
    "contractHasValue": false,
    "paymentFrequency": "Daily",
    "paymentFrequencyValue": 0,
    "clientPaymentTerms": "UponReceipt",
    "clientPaymentTermsValue": 0
}
```

* `RETURNS`

```json
{
    "success": true,
    "address": "0xCBE2D5529C7ebe642292507521a79b44d014e3cb",
    "network": 3,
    "transactionHash": "0xce08f00cec646edf7e602a415090493e712b11d6b9a0a15dccf81fe06cd469a6"
}
```

##### Check the status

* `GET /api/chain/3/0xce08f00cec646edf7e602a415090493e712b11d6b9a0a15dccf81fe06cd469a6/receipt`
     * See: `/chain/{networkId}/{transactionHash}`
* `RESPONSE`
```json
{
    "blockHash": "0xf02600068be4fe9f3e2f79c3f38d404f0ca22046dc42e74cd8929ed94db10ff4",
    "blockNumber": 5005749,
    "contractAddress": null,
    "cumulativeGasUsed": "0xe2eeb",
    "from": "0x0df0cC6576Ed17ba870D6FC271E20601e3eE176e",
    "gasUsed": "0x3777b",
    "logs": [
        ...
    ],
    "logsBloom": "0x00002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000020040000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000040000000000000000000000000000000000000000000000000000800000000000000",
    "status": "0x1", // SEE STATUS OF 1 so it was succesful
    "to": "0xCBE2D5529C7ebe642292507521a79b44d014e3cb",
    "transactionHash": "0xce08f00cec646edf7e602a415090493e712b11d6b9a0a15dccf81fe06cd469a6",
    "transactionIndex": 2
}
```

##### Query Contract Details

* `GET /api/contracts/3/details/1`
    * See: `/contracts/{networkId}/details/{contractId}`
* `RESPONSE`
```json
{
    "creationDate": "1549989978",
    "startDate": "0",
    "endDate": "0",
    "partyA": "1",
    "partyB": "1",
    "state": "Pending",
    "duration": "FixedTerm",
    "contractData": "ipfs-1234-abc-hash",
    "contractHasValue": false,
    "paymentFrequency": "Daily",
    "paymentFrequencyValue": "0",
    "clientPaymentTerms": "UponReceipt",
    "clientPaymentTermsValue": "0",
    "invoiceIds": [],
    "invoices": {}
}
```
