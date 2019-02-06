const _ = require('lodash');

const transactions = require('express').Router();

const {httpProvider} = require('../web3/web3Provider');

transactions.get('status/:txsHash', async (req, res) => {
    const {txsHash} = req.param;
    // post transaction
    // return txs hash
});


module.exports = transactions;
