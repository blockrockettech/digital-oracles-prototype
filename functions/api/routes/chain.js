const _ = require('lodash');
const Web3 = require('web3');

const gasPriceService = require('../services/gasPriceApi.service');
const blockchainService = require('../services/blockchain.service');
const {getNetwork} = require("../web3/network");
const {MAX_GAS_PRICE} = require("../../const");

const chain = require('express').Router();

chain.get('/:network/:txsHash/raw', async (req, res, next) => {
    try {
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
    } catch (e) {
        next(e);
    }
});

chain.get('/:network/:txsHash/receipt', async (req, res, next) => {
    try {
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
    } catch (e) {
        next(e);
    }
});

chain.get('/:network/block/latest', async (req, res, next) => {
    try {
        const {network} = req.params;

        const blockNumber = await blockchainService.getLatestBlockNumber(getNetwork(network));

        return res
            .status(200)
            .json({
                blockNumber
            });
    } catch (e) {
        next(e);
    }
});

chain.get('/:network/account/balance', async (req, res, next) => {
    try {
        const {network} = req.params;

        const accountBalance = await blockchainService.getAccountBalance(getNetwork(network));

        return res
            .status(200)
            .json({
                accountBalanceInWei: accountBalance,
                accountBalanceInEth: Web3.utils.fromWei(accountBalance, 'ether')
            });
    } catch (e) {
        next(e);
    }
});

chain.get('/:network/account/nonce', async (req, res) => {
    try {
        const {network} = req.params;

        const nonce = await blockchainService.getTransactionCount(getNetwork(network));

        return res
            .status(200)
            .json({
                nonce
            });
    } catch (e) {
        next(e);
    }
});

chain.get('/gasPrice', async (req, res, next) => {
    try {
        const currentPrice = await gasPriceService.getGasPrice();

        return res
            .status(200)
            .json({
                currentPrice,
                isOverThreshold: gasPriceService.isOverThreshold(currentPrice),
                threshold: MAX_GAS_PRICE
            });
    } catch (e) {
        next(e);
    }
});

module.exports = chain;
