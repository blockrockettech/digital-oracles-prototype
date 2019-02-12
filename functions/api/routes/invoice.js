const _ = require('lodash');

const invoices = require('express').Router();

const digitalOraclesService = require('../services/digitalOralces.service');
const {getNetwork} = require("../web3/network");
const {fromEnumString, InvoiceStatus} = require("../data/contractTypes");

invoices.post('/add', async (req, res, next) => {
    try {
        const {network, contractId, invoiceId} = req.body;

        // default to Pending if not found
        const invoiceState = _.get(req.body, 'invoiceState', 'Pending');

        const results = await digitalOraclesService.addInvoiceToContract(
            getNetwork(network), contractId, invoiceId, fromEnumString(InvoiceStatus, invoiceState)
        );

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

invoices.post('/update', async (req, res, next) => {
    try {
        const {network, contractId, invoiceId, invoiceState} = req.body;

        const results = await digitalOraclesService.updateInvoiceState(
            getNetwork(network), contractId, invoiceId, fromEnumString(InvoiceStatus, invoiceState)
        );

        return res
            .status(200)
            .json(results);
    } catch (e) {
        next(e);
    }
});

invoices.get('/:network/id/:invoiceId/', async (req, res, next) => {
    try {
        const {network, invoiceId} = req.body;

        const {
            invoiceStatus,
            contractId
        } = await digitalOraclesService.getContractInvoiceDetails(getNetwork(network), invoiceId);

        const invoiceIds = await digitalOraclesService.getContractInvoices(getNetwork(network), contractId);

        return res
            .status(200)
            .json({
                invoiceStatus,
                contractId,
                contract: {
                    invoiceIds
                }
            });
    } catch (e) {
        next(e);
    }
});


module.exports = invoices;
