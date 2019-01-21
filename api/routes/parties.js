const _ = require('lodash');

const types = require('express').Router();

const {httpProvider} = require('../web3/web3Provider');

types.post('create', async (req, res) => {
    const {id, name} = req.body;
    // post transaction
    // return txs hash
});

types.post('disable', async (req, res) => {
    const {id} = req.body;
    // post transaction
    // return txs hash
});

types.post('enable', async (req, res) => {
    const {id} = req.body;
    // post transaction
    // return txs hash
});

types.get('find', async (req, res) => {
    const {id} = req.body;
    // call contract
    // return data
});


module.exports = types;
