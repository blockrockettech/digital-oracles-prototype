const _ = require('lodash');

const contracts = require('express').Router();

const digitalOraclesService = require('../services/digitalOralces.service');
const {getNetwork} = require("../web3/network");
const {
    fromEnumString,
    ClientPaymentTerms,
    ContractDuration,
    ContractState,
    InvoiceStatus,
    PaymentFrequency
} = require("../data/contractTypes");

contracts.post('/create', async (req, res, next) => {
    try {
        const {network} = req.body;

        // Map from friendly values to enum values
        const payload = _.omit(req.body, ['network']);
        payload.duration = fromEnumString(ContractDuration, payload.duration);
        payload.paymentFrequency = fromEnumString(PaymentFrequency, payload.paymentFrequency);
        payload.clientPaymentTerms = fromEnumString(ClientPaymentTerms, payload.clientPaymentTerms);

        const results = await digitalOraclesService.createContract(getNetwork(network), payload);

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/update/state', async (req, res, next) => {
    try {
        const {network, contractId, state} = req.body;

        const results = await digitalOraclesService.updateContractState(
            getNetwork(network), contractId, fromEnumString(ContractState, state)
        );

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/update/startDate', async (req, res, next) => {
    try {
        const {network, contractId, startDate} = req.body;

        const results = await digitalOraclesService.updateContractStartDate(
            getNetwork(network), contractId, startDate
        );

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/update/endDate', async (req, res, next) => {
    try {
        const {network, contractId, endDate} = req.body;

        const results = await digitalOraclesService.updateContractEndDate(
            getNetwork(network), contractId, endDate
        );

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});
contracts.post('/update/contractHasValue', async (req, res, next) => {
    try {
        const {network, contractId, contractHasValue} = req.body;

        const results = await digitalOraclesService.updateContractHasValue(
            getNetwork(network), contractId, contractHasValue
        );

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

contracts.post('/approve', async (req, res, next) => {
    try {
        const {contractId, network} = req.body;

        const results = await digitalOraclesService.approveContract(getNetwork(network), contractId);

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
