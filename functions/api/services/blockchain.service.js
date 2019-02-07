const _ = require("lodash");
const {httpProvider} = require("../web3/web3Provider");
const privateKey = require('../web3/privateKey');

class BlockchainService {

    async getTransaction(network, txsHash) {
        const web3 = httpProvider(network);
        return web3.eth.getTransaction(txsHash);
    }

    /**
     * If successful it will NOT contain a [status] of [false]`
     */
    async getTransactionReceipt(network, txsHash) {
        const web3 = httpProvider(network);
        return web3.eth.getTransactionReceipt(txsHash);
    }

    async getTransactionCount(network) {
        const web3 = httpProvider(network);
        const address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        return web3.eth.getTransactionCount(address);
    }

    async getAccountBalance(network) {
        const web3 = httpProvider(network);
        const address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        return web3.eth.getBalance(address);
    }

    async getLatestBlockNumber(network) {
        const web3 = httpProvider(network);
        return web3.eth.getBlockNumber();
    }
}

module.exports = new BlockchainService();
