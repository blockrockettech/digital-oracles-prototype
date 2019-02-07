const _ = require("lodash");
const {getAddress} = require("../web3/network");
const {httpProvider} = require("../web3/web3Provider");
const DigitalOraclesAbi = require('../web3/abi/digitalOracles.abi');
const gasPriceService = require('./gasPriceApi.service');
const GasToHighError = require('../errors/GasToHighError');

const privateKey = require('../web3/privateKey');

class DigitalOraclesService {

    async createContract(network, contractId, partyA) {
        console.log(`Create contract for network [${network}]`, contractId, partyA);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.createContract(contractId, partyA).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async setPartyBToContract(network, contractId, partyB) {
        console.log(`Set party B for network [${network}]`, contractId, partyB);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.setPartyBToContract(contractId, partyB).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async approveContract(network, contractId, partyB, contractData, invoiceId) {
        console.log(`Approve contract for network [${network}]`, contractId, partyB, contractData, invoiceId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        let data = null;
        if (!_.isUndefined(invoiceId)) {
            console.log("Approving with invoice ID", invoiceId);
            data = DigitalOracles.methods['approveContract(uint256,uint256,string,uint256)'](contractId, partyB, contractData, invoiceId).encodeABI();
        } else if (contractData) {
            data = DigitalOracles.methods['approveContract(uint256,uint256,string)'](contractId, partyB, contractData).encodeABI();
        }

        return this.sendTxs(web3, data, address, network);
    }

    async terminateContract(network, contractId) {
        console.log(`Terminate contract for network [${network}]`, contractId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.terminateContract(contractId).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async addInvoiceToContract(network, contractId, invoiceId) {
        console.log(`Add invoice to contract for network [${network}]`, contractId, invoiceId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.addInvoiceToContract(contractId, invoiceId).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async getContract(network, contractId) {
        console.log(`Get contract for network [${network}]`, contractId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const result = await DigitalOracles.methods.getContract(contractId).call();

        return {
            creationDate: result.creationDate,
            partyA: result.partyA,
            partyB: result.partyB,
            state: result.state,
            contractData: result.contractData,
            invoiceIds: result.invoiceIds
        };
    }

    async getContractInvoices(network, contractId) {
        console.log(`Get contract invoices for network [${network}]`, contractId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const {invoiceIds} = await DigitalOracles.methods.getContractInvoices(contractId).call();

        return {
            invoiceIds
        };
    }

    async sendTxs(web3, data, to, network) {

        const gasPrice = await gasPriceService.getGasPrice();
        if (gasPriceService.isOverThreshold(gasPrice)) {
            console.warn(`GAS price over threshold [${gasPrice}]`);
            throw new GasToHighError();
        }

        const from = web3.eth.accounts.privateKeyToAccount(privateKey).address;

        // FIXME THIS ISNT WORKING - DEBUG IT
        // const gasLimit = await web3.eth.estimateGas({to, data});
        // TEMP SOLUTION BELOW - get last block limit minus 1 million
        const gasLimit = (await web3.eth.getBlock("latest")).gasLimit - 1000000;
        console.log(`Checked gas - price=[${gasPrice}] - limit=[${gasLimit}]`);

        const txs = {
            from: from,
            to: to,
            data: data,
            gasPrice: gasPrice,
            gas: gasLimit
        };

        const signedTx = await web3.eth.accounts.signTransaction(txs, privateKey);
        console.log(`Submitting TXS to network [${network}]`, txs);

        return new Promise((resolve, reject) => {
            web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('transactionHash', hash => {
                    console.log('Transaction submitted', hash);
                    resolve({
                        success: true,
                        address: to,
                        network,
                        transactionHash: hash
                    });
                })
                // If a out of gas error, the second parameter is the receipt.
                .on('error', (error) => {
                    console.warn('Failed to submit transaction', error);
                    reject({
                        success: true,
                        address: to,
                        network,
                        error: error
                    });
                });
        });
    }
}

module.exports = new DigitalOraclesService();
