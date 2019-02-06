const _ = require('lodash');

const contracts = require('express').Router();

const digitalOraclesService = require('../services/digitalOralces.service');
const {getNetwork} = require("../web3/network");

contracts.post('/create', async (req, res) => {
    const {contractId, partyA, network} = req.body;

    const results = await digitalOraclesService.createContract(getNetwork(network), contractId, partyA);

    return res
        .status(200)
        .json(results);
});

contracts.post('/update/partyB', async (req, res) => {
    const {contractId, network, partyB} = req.body;

    const results = await digitalOraclesService.setPartyBToContract(getNetwork(network), contractId, partyB);

    return res
        .status(200)
        .json(results);
});

contracts.post('/approve', async (req, res) => {
    const {contractId, partyB, contractData, network} = req.body;

    // optional so we cant explode
    const invoiceId =  req.body.invoiceId;

    const results = await digitalOraclesService.approveContract(getNetwork(network), contractId, partyB, contractData, invoiceId);

    return res
        .status(200)
        .json(results);
});

contracts.post('/terminate', async (req, res) => {
    const {contractId, network} = req.body;

    const results = await digitalOraclesService.terminateContract(getNetwork(network), contractId);

    return res
        .status(200)
        .json(results);
});


module.exports = contracts;
