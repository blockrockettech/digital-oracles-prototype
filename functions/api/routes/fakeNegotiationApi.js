const _ = require('lodash');


const fakeNegotiation = require('express').Router();

const CONTRACT_STATES = {
    INITIATED_AGREEMENT: "INITIATED_AGREEMENT"
};

const SECTION_STATES = {
    INITIATED: "INITIATED"
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

        console.log(dummyData);

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

        const foundContract = dummyData[contractId];

        const dateSaved = Date.now();

        // Push a change set in so we can then filter on these to get the latest
        const changeSet = {
            ...details,
            editor: editor,
            savedDatetime: dateSaved
        };

        // Push the date set and update timestamp
        foundContract.details.changes.push(changeSet);
        foundContract.details.lastUpdatedDatetime = dateSaved;

        // update the working version and state accordingly
        if (editor === 'client') {
            foundContract.details.state = 'CLIENT_LAST_UPDATED';
            foundContract.details.client = changeSet;
        } else if (editor === 'supplier') {
            foundContract.details.state = 'SUPPLIER_LAST_UPDATED';
            foundContract.details.supplier = changeSet;
        }

        // Set on dummy object
        dummyData[contractId] = foundContract;

        console.log(dummyData);

        return res
            .status(200)
            .json(foundContract);

    } catch (error) {
        next(error);
    }
});

fakeNegotiation.get('/findContractNegotiation/:contractId', async (req, res, next) => {
    try {
        console.log(req.params);

        const {contractId} = req.params;

        const foundContract = dummyData[contractId];

        console.log(dummyData);

        return res
            .status(200)
            .json(foundContract);
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
