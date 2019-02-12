const _ = require('lodash');

const contracts = require('express').Router();

const digitalOraclesService = require('../services/digitalOralces.service');
const {getNetwork} = require("../web3/network");

contracts.post('/create', async (req, res, next) => {
    try {
        const {contractId, partyA, network} = req.body;

        const results = await digitalOraclesService.createContract(getNetwork(network), contractId, partyA);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/approve', async (req, res, next) => {
    try {
        const {contractId, partyB, contractData, network} = req.body;

        // optional so we cant explode
        const invoiceId = req.body.invoiceId;

        const results = await digitalOraclesService.approveContract(getNetwork(network), contractId, partyB, contractData, invoiceId);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/terminate', async (req, res, next) => {
    try {
        const {contractId, network} = req.body;

        const results = await digitalOraclesService.terminateContract(getNetwork(network), contractId);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});


contracts.post('/replace', async (req, res, next) => {
    try {
        const {originalContractId, replacementContractId, network} = req.body;

        const results = await digitalOraclesService.replaceContract(getNetwork(network), originalContractId, replacementContractId);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.get('/:network/details/:contractId/', async (req, res, next) => {
    try {
        const {contractId, network} = req.params;

        const results = await digitalOraclesService.getContract(getNetwork(network), contractId);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/invoices/add', async (req, res, next) => {
    try {
        const {network, contractId, invoiceId} = req.body;

        const results = await digitalOraclesService.addInvoiceToContract(getNetwork(network), contractId, invoiceId);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.get('/:network/invoices/:contractId/', async (req, res, next) => {
    try {
        const {network, contractId} = req.body;

        const results = await digitalOraclesService.getContractInvoices(getNetwork(network), contractId);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});


module.exports = contracts;
