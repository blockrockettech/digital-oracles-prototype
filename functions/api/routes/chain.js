const _ = require('lodash');
const Web3 = require('web3');

const blockchainService = require('../services/blockchain.service');
const {getNetwork} = require("../web3/network");

const chain = require('express').Router();

chain.get('/:network/:txsHash/raw', async (req, res) => {
    const {txsHash, network} = req.params;

    const results = await blockchainService.getTransaction(getNetwork(network), txsHash);
    if (!results) {
        return res.status(400).json({
            success: false,
            txsNotFound: true,
            txsHash,
            network
        });
    }

    return res
        .status(200)
        .json(results);
});

chain.get('/:network/:txsHash/receipt', async (req, res) => {
    const {txsHash, network} = req.params;

    const results = await blockchainService.getTransactionReceipt(getNetwork(network), txsHash);

    if (!results) {
        return res.status(400).json({
            notFound: true,
            txsNotFound: true,
            txsHash,
            network
        });
    }

    return res
        .status(200)
        .json(results);
});

chain.get('/:network/block/latest', async (req, res) => {
    const {network} = req.params;

    const blockNumber = await blockchainService.getLatestBlockNumber(getNetwork(network));

    return res
        .status(200)
        .json({
            blockNumber
        });
});

chain.get('/:network/account/balance', async (req, res) => {
    const {network} = req.params;

    const accountBalance = await blockchainService.getAccountBalance(getNetwork(network));

    return res
        .status(200)
        .json({
            accountBalanceInWei: accountBalance,
            accountBalanceInEth: Web3.utils.fromWei(accountBalance, 'ether')
        });
});

chain.get('/:network/account/nonce', async (req, res) => {
    const {network} = req.params;

    const nonce = await blockchainService.getTransactionCount(getNetwork(network));

    return res
        .status(200)
        .json({
            nonce
        });
});

module.exports = chain;
