const _ = require("lodash");
const {getAddress} = require("../web3/network");
const {httpProvider} = require("../web3/web3Provider");
const DigitalOraclesAbi = require('../web3/abi/digitalOracles.abi');
const gasPriceService = require('./gasPriceApi.service');
const GasToHighError = require('../errors/GasToHighError');

const privateKey = require('../web3/privateKey');

class DigitalOraclesService {

    async createContract(network, payload) {
        console.log(`Create contract for network [${network}]`, payload);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const {
            contractId,
            startDate,
            endDate,
            partyA,
            partyB,
            contractData,
            duration,
            contractHasValue,
            paymentFrequency,
            paymentFrequencyValue,
            clientPaymentTerms,
            clientPaymentTermsValue
        } = payload;

        const data = DigitalOracles.methods.createContract(
            contractId,
            startDate,
            endDate,
            partyA,
            partyB,
            contractData,
            duration,
            contractHasValue,
            paymentFrequency,
            paymentFrequencyValue,
            clientPaymentTerms,
            clientPaymentTermsValue
        ).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async updateContractState(network, contractId, state) {
        console.log(`Updating contract state to [${state}] for network [${network}]`, contractId);
        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.updateContractState(contractId, state).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async updateContractStartDate(network, contractId, startDate) {
        console.log(`Updating contract start date to [${startDate}] for network [${network}]`, contractId);
        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.updateContractStartDate(contractId, startDate).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async updateContractEndDate(network, contractId, endDate) {
        console.log(`Updating contract end date to [${endDate}] for network [${network}]`, contractId);
        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.updateContractEndDate(contractId, endDate).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async updateContractHasValue(network, contractId, contractHasValue) {
        console.log(`Updating contract has value to [${contractHasValue}] for network [${network}]`, contractId);
        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.updateContractHasValue(contractId, contractHasValue).encodeABI();

        return this.sendTxs(web3, data, address, network);
    }

    async approveContract(network, contractId) {
        console.log(`Approve contract for network [${network}]`, contractId);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.approveContract(contractId).encodeABI();

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

    async replaceContract(network, originalContractId, replacementContractId) {
        console.log(`Replacing contract [${originalContractId}] with new contract [${replacementContractId}] for network [${network}]`);

        const web3 = httpProvider(network);
        const address = getAddress(network);
        const DigitalOracles = new web3.eth.Contract(DigitalOraclesAbi, address);

        const data = DigitalOracles.methods.replaceContract(originalContractId, replacementContractId).encodeABI();

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
