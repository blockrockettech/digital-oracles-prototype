const _ = require("lodash");
const {getAddress} = require("../web3/network");
const {httpProvider} = require("../web3/web3Provider");
const DigitalOraclesAbi = require('../web3/abi/digitalOracles.abi');
const gasPriceService = require('./gasPriceApi.service');

const privateKey = require('../web3/privateKey');

class DigitalOraclesService {

    async createContract(network, contractId, partyA) {
        console.log(network, contractId, partyA);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.createContract(contractId, partyA).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async setPartyBToContract(network, contractId, partyB) {
        console.log(network, contractId, partyB);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.setPartyBToContract(contractId, partyB).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async approveContract(network, contractId, partyB, contractData, invoiceId) {
        console.log(network, contractId, partyB, contractData, invoiceId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        let data = null;
        if (!_.isUndefined(invoiceId)) {
            data = DigitalOracles.methods['approveContract(uint256,uint256,bytes32,uint256)'](contractId, partyB, contractData, invoiceId).encodeABI();
        } if (contractData) {
            data = DigitalOracles.methods['approveContract(uint256,uint256,bytes32)'](contractId, partyB, contractData).encodeABI();
        }

        return this.sendTxs(web3, data, address, network);
    }

    async terminateContract(network, contractId) {
        console.log(network, contractId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.terminateContract(contractId).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async addInvoiceToContract(network, contractId, invoiceId) {
        console.log(network, contractId, invoiceId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.addInvoiceToContract(contractId, invoiceId).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async getContract(network, contractId) {

    }

    async getContractInvoices(network, contractId) {

    }

    async sendTxs(web3, data, address, network) {

        const gasPrice = await gasPriceService.getGasPrice();
        const gasLimit = (await web3.eth.getBlock("latest")).gasLimit;

        const txs = {
            from: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            to: address,
            data: data,
            gasPrice: gasPrice,
            gas: gasLimit
        };

        const signedTx = await web3.eth.accounts.signTransaction(txs, privateKey);

        return new Promise((resolve, reject) => {
            web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on('transactionHash', hash => {
                    console.log('Transaction submitted', hash);
                    resolve({
                        success: true,
                        address,
                        network,
                        transactionHash: hash
                    });
                })
                .catch((error) => {
                    console.log('Failed to submit transaction', error);
                    reject({
                        success: true,
                        address,
                        network,
                        error: error
                    });
                });
        });
    }
}

module.exports = new DigitalOraclesService();
