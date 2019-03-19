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
        const {client, supplier, projectId} = req.body;

        // TODO generate from DB
        const contractId = Math.floor(Math.random() * 100000);

        const contract = {
            contractId: contractId,
            projectId: projectId,
            state: CONTRACT_STATES.INITIATED_AGREEMENT,
            // FIXME - I am placing the full client and supplier in here but it should only be the IDs
            client,
            supplier,
            details: {
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

fakeNegotiation.post('/saveDetails', async (req, res, next) => {
    try {
        console.log(req.body);

        // FIXME int he real world you will need to look up the correct properties for, relying on editor isnt great...
        const {clientId, details, editor, projectId, supplierId, contractId} = req.body;

        const foundContract = dummyData[contractId];

        // Push a change set in so we can then filter on these to get the latest
        const changeSet = {
            ...details,
            editor: editor,
            added: Date.now()
        };
        foundContract.details.changes.push(changeSet);

        // update the working version
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
