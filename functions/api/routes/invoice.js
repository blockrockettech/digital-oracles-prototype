const _ = require('lodash');

const invoices = require('express').Router();

const {httpProvider} = require('../web3/web3Provider');

invoices.post('add', async (req, res) => {
    const {contractId, invoiceId} = req.body;
    // post transaction
    // return txs hash
});

invoices.get('contract', async (req, res) => {
    const {contractId, invoiceId} = req.body;
    // post transaction
    // return txs hash
});

module.exports = invoices;
