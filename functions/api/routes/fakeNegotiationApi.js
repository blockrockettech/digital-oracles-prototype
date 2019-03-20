const _ = require('lodash');


const fakeNegotiation = require('express').Router();

const CONTRACT_STATES = {
    INITIATED_AGREEMENT: "INITIATED_AGREEMENT"
};

const SECTION_STATES = {
    INITIATED: "INITIATED",
    CLIENT_LAST_UPDATED: "CLIENT_LAST_UPDATED",
    SUPPLIER_LAST_UPDATED: "SUPPLIER_LAST_UPDATED",
    TERMS_ACCEPTED: "TERMS_ACCEPTED"
};

let dummyData = {};


fakeNegotiation.post('/init', async (req, res, next) => {
    try {
        const {clientId, supplierId, projectId} = req.body;

        const contractId = Math.floor(Math.random() * 100000);

        const contract = {
            // TODO generate from DB
            contractId: contractId,

            // Mu assumption is that a contract requires a client, supplier and project to work
            projectId: projectId,
            clientId: clientId,
            supplierId: supplierId,

            // Default start to INIT
            state: CONTRACT_STATES.INITIATED_AGREEMENT,

            // Details block is terms of service, maybe rename
            details: {
                lastUpdatedDatetime: Date.now(),
                state: SECTION_STATES.INITIATED,

                // Changes represent the an ordered list of changes for both parties
                changes: [],

                // Client and supplier objects represent the latest changes for both parties
                client: {
                    ...blankDetailsBlock()
                },
                supplier: {
                    ...blankDetailsBlock()
                }
            }
        };

        // Set on dummy object
        dummyData[contractId] = contract;

        console.log(contract);

        return res
            .status(200)
            .json(contract);

    } catch (error) {
        next(error);
    }
});

fakeNegotiation.post('/saveTermsOfService', async (req, res, next) => {
    try {
        console.log(req.body);

        // FIXME in the real world you will need to look up the correct properties for
        // FIXME we should really work this out based on currently logged in user which I dont have in the fake API
        const {contractId, details, editor, projectId, supplierId, clientId} = req.body;

        const contract = _.clone(dummyData[contractId]);

        const dateSaved = Date.now();

        // Push a change set in so we can then filter on these to get the latest
        const changeSet = {
            ...details,
            editor: editor,
            savedDatetime: dateSaved
        };

        // Push the date set and update timestamp
        contract.details.changes.push(changeSet);
        contract.details.lastUpdatedDatetime = dateSaved;

        // Check if its only one side who has made changes so far
        const allChangeMadeBySingleParty = _.every(contract.details.changes, (change) => change.editor === editor);
        console.log("allChangeMadeBySingleParty", allChangeMadeBySingleParty);

        // update the working version and state accordingly
        if (editor === 'client') {
            contract.details.state = SECTION_STATES.CLIENT_LAST_UPDATED;
            contract.details.client = changeSet;

            // Copy changes to other party
            if (allChangeMadeBySingleParty) {
                contract.details.supplier = changeSet;
            }
        } else if (editor === 'supplier') {
            contract.details.state = SECTION_STATES.SUPPLIER_LAST_UPDATED;
            contract.details.supplier = changeSet;

            // Copy changes to other party
            if (allChangeMadeBySingleParty) {
                contract.details.client = changeSet;
            }
        }

        // Set on dummy object
        dummyData[_.toNumber(contractId)] = contract;

        console.log(contract);

        return res
            .status(200)
            .json(contract);

    } catch (error) {
        next(error);
    }
});

fakeNegotiation.post('/acceptTermsOfService', async (req, res, next) => {
    try {
        console.log(req.body);

        // FIXME in the real world you will need to look up the correct properties for
        // FIXME we should really work this out based on currently logged in user which I dont have in the fake API
        const {contractId, editor, projectId, supplierId, clientId} = req.body;

        const contract = _.clone(dummyData[contractId]);

        // Push the date set and update timestamp
        contract.details.lastUpdatedDatetime = Date.now();
        contract.details.state = SECTION_STATES.TERMS_ACCEPTED;

        // update the working version to be the accepted parties selection
        if (editor === 'client') {
            contract.details.client = _.clone(contract.details.supplier);
        } else if (editor === 'supplier') {
            contract.details.supplier = _.clone(contract.details.client);
        }

        // Set on dummy object
        dummyData[_.toNumber(contractId)] = contract;

        console.log(contract);

        return res
            .status(200)
            .json(contract);

    } catch (error) {
        next(error);
    }
});

fakeNegotiation.get('/findContractNegotiation/:contractId', async (req, res, next) => {
    try {
        console.log(req.params);

        const {contractId} = req.params;

        const contract = _.clone(dummyData[contractId]);

        console.log(contract);

        return res
            .status(200)
            .json(contract);
    } catch (error) {
        next(error);
    }
});


const blankDetailsBlock = () => {
    return {
        description: null,
        projectValue: null,
        includesVat: true,
        paymentFrequency: null,
        paymentFrequencyValue: null,
        currentPaymentTermsValue: null,
        currentPaymentTerms: null,
        monthlyLatePaymentPercentage: null,
        selectedContractType: null,
        contractDuration: null,
        noticePeriodDays: null,
        projectEndDate: null,
        projectStartDate: null
    };
};

module.exports = fakeNegotiation;
