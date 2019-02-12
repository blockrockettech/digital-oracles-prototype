const _ = require("lodash");
const {httpProvider} = require("../web3/web3Provider");
const privateKey = require('../web3/privateKey');

class BlockchainService {

    async getTransaction(network, txsHash) {
        console.log(`getting transaction on network [${network}]`, txsHash);
        const web3 = httpProvider(network);
        return web3.eth.getTransaction(txsHash);
    }

    /**
     * If successful it will NOT contain a [status] of [false] || [0x0]`
     */
    async getTransactionReceipt(network, txsHash) {
        console.log(`Getting transaction receipt on network [${network}]`, txsHash);
        const web3 = httpProvider(network);
        return web3.eth.getTransactionReceipt(txsHash);
    }

    async getTransactionCount(network) {
        const web3 = httpProvider(network);
        const address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        console.log(`Getting address txs count on network [${network}]`, address);
        return web3.eth.getTransactionCount(address);
    }

    async getAccountBalance(network) {
        const web3 = httpProvider(network);
        const address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        console.log(`Getting address balance on network [${network}]`, address);
        const accountBalance = await web3.eth.getBalance(address);
        return {
            accountBalanceInWei: accountBalance,
            accountBalanceInEth: web3.utils.fromWei(accountBalance, 'ether')
        };
    }

    async getLatestBlockNumber(network) {
        console.log(`Getting last block on network [${network}]`);
        const web3 = httpProvider(network);
        return web3.eth.getBlockNumber();
    }
}

module.exports = new BlockchainService();
