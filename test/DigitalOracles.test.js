const _ = require('lodash');
const moment = require('moment');
const DigitalOracles = artifacts.require('DigitalOracles');
const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

const {
    ContractState,
    ContractDuration,
    PaymentFrequency,
    ClientPaymentTerms,
    InvoiceStatus
} = require('../functions/api/data/contractTypes');

contract.only('DigitalOracles tests', function (accounts) {

    const _owner = accounts[0];

    const PARTY_A = 1;
    const PARTY_B = 2;
    const PARTY_C = 3;

    const CONTRACT_1 = 1;
    const CONTRACT_2 = 2;
    const CONTRACT_3 = 3;

    const INVOICE_ID_1 = 1;
    const INVOICE_ID_2 = 2;
    const INVOICE_ID_3 = 3;

    const START_DATE = moment().unix();
    const END_DATE = moment().unix();

    const IPFS_HASH = "1234-abcd";

    beforeEach(async function () {
        this.digitalOracles = await DigitalOracles.new({from: _owner});
    });

    context('validation', async function () {
        // TODO add more tests around validation once we know more
    });

    context('basic contract workflow', async function () {

        it("basic approval without invoice", async function () {

            const {logs: creationLogs} = await this.digitalOracles.createContract(
                CONTRACT_1,
                START_DATE,
                END_DATE,
                PARTY_A,
                PARTY_B,
                IPFS_HASH,
                ContractDuration.FixedTerm,
                false,
                PaymentFrequency.Daily,
                0,
                ClientPaymentTerms.WithXDays,
                30
            );
            expectEvent.inLogs(creationLogs,
                `ContractCreated`,
                {
                    contractId: new BN(CONTRACT_1),
                    partyA: new BN(PARTY_A),
                    partyB: new BN(PARTY_B),
                    contractData: IPFS_HASH
                }
            );

            const {
                creationDate, startDate, endDate, partyA, partyB, state, duration, contractData
            } = await this.digitalOracles.getContractDetails(CONTRACT_1);

            startDate.should.be.bignumber.eq(START_DATE.toString());
            endDate.should.be.bignumber.eq(END_DATE.toString());
            partyA.should.be.bignumber.eq(PARTY_A.toString());
            partyB.should.be.bignumber.eq(PARTY_B.toString());
            state.should.be.bignumber.eq(ContractState.Pending.toString());
            duration.should.be.bignumber.eq(ContractDuration.FixedTerm.toString());
            contractData.should.be.eq(IPFS_HASH);
            creationDate.should.not.be.null;

            const {
                contractHasValue, paymentFrequency, paymentFrequencyValue, clientPaymentTerms, clientPaymentTermsValue
            } = await this.digitalOracles.getContractTerms(CONTRACT_1);

            contractHasValue.should.be.eq(false);
            paymentFrequency.should.be.bignumber.eq(PaymentFrequency.Daily.toString());
            paymentFrequencyValue.should.be.bignumber.eq('0');
            clientPaymentTerms.should.be.bignumber.eq(ClientPaymentTerms.WithXDays.toString());
            clientPaymentTermsValue.should.be.bignumber.eq('30');

            const invoiceIds = await this.digitalOracles.getContractInvoices(CONTRACT_1);
            invoiceIds.should.be.deep.eq([]);

            const {logs: approvalLogs} = await this.digitalOracles.approveContract(CONTRACT_1);
            expectEvent.inLogs(approvalLogs,
                `ContractApproved`,
                {
                    contractId: new BN(CONTRACT_1)
                }
            );

            const {
                state: expectedState,
            } = await this.digitalOracles.getContractDetails(CONTRACT_1);

            expectedState.should.be.bignumber.eq(ContractState.Approved.toString());
        });

        it('termination of contract', async function () {
            await this.digitalOracles.createContract(
                CONTRACT_1,
                START_DATE,
                END_DATE,
                PARTY_A,
                PARTY_B,
                IPFS_HASH,
                ContractDuration.FixedTerm,
                false,
                PaymentFrequency.Daily,
                0,
                ClientPaymentTerms.WithXDays,
                30
            );

            const {state} = await this.digitalOracles.getContractDetails(CONTRACT_1);
            state.should.be.bignumber.eq(ContractState.Pending.toString());

            const {logs: rejectionLogs} = await this.digitalOracles.terminateContract(CONTRACT_1);
            expectEvent.inLogs(rejectionLogs,
                `ContractTerminated`,
                {
                    contractId: new BN(CONTRACT_1)
                }
            );

            const {state: rejectedState} = await this.digitalOracles.getContractDetails(CONTRACT_1);
            rejectedState.should.be.bignumber.eq(ContractState.Terminated.toString());
        });

        it('approval of contract', async function () {
            await this.digitalOracles.createContract(
                CONTRACT_1,
                START_DATE,
                END_DATE,
                PARTY_A,
                PARTY_B,
                IPFS_HASH,
                ContractDuration.FixedTerm,
                false,
                PaymentFrequency.Daily,
                0,
                ClientPaymentTerms.WithXDays,
                30
            );

            const {state} = await this.digitalOracles.getContractDetails(CONTRACT_1);
            state.should.be.bignumber.eq(ContractState.Pending.toString());

            const {logs: approvalLogs} = await this.digitalOracles.approveContract(CONTRACT_1);
            expectEvent.inLogs(approvalLogs,
                `ContractApproved`,
                {
                    contractId: new BN(CONTRACT_1)
                }
            );

            const {state: rejectedState} = await this.digitalOracles.getContractDetails(CONTRACT_1);
            rejectedState.should.be.bignumber.eq(ContractState.Approved.toString());
        });

        it('replacement of contract', async function () {
            // Create contract 1
            await this.digitalOracles.createContract(
                CONTRACT_1,
                START_DATE,
                END_DATE,
                PARTY_A,
                PARTY_B,
                IPFS_HASH,
                ContractDuration.FixedTerm,
                false,
                PaymentFrequency.Daily,
                0,
                ClientPaymentTerms.WithXDays,
                30
            );

            // Create contract 2
            await this.digitalOracles.createContract(
                CONTRACT_2,
                START_DATE,
                END_DATE,
                PARTY_A,
                PARTY_B,
                IPFS_HASH,
                ContractDuration.FixedTerm,
                false,
                PaymentFrequency.Daily,
                0,
                ClientPaymentTerms.WithXDays,
                30
            );

            const {state} = await this.digitalOracles.getContractDetails(CONTRACT_1);
            state.should.be.bignumber.eq(ContractState.Pending.toString());

            const {logs: approvalLogs} = await this.digitalOracles.replaceContract(CONTRACT_1, CONTRACT_2);
            expectEvent.inLogs(approvalLogs,
                `ContractReplaced`,
                {
                    contractId: new BN(CONTRACT_1),
                    replacementContractId: new BN(CONTRACT_2)
                }
            );

            const {state: replacedContractState} = await this.digitalOracles.getContractDetails(CONTRACT_1);
            replacedContractState.should.be.bignumber.eq(ContractState.Replaced.toString());

            const {state: contact2State} = await this.digitalOracles.getContractDetails(CONTRACT_2);
            contact2State.should.be.bignumber.eq(ContractState.Pending.toString());
        });

        it('adding an invoice to a contract', async function () {
            await this.digitalOracles.createContract(
                CONTRACT_1,
                START_DATE,
                END_DATE,
                PARTY_A,
                PARTY_B,
                IPFS_HASH,
                ContractDuration.FixedTerm,
                false,
                PaymentFrequency.Daily,
                0,
                ClientPaymentTerms.WithXDays,
                30
            );

            const {logs: paidInvoice} = await this.digitalOracles.addInvoiceToContract(CONTRACT_1, INVOICE_ID_1, InvoiceStatus.Paid);
            expectEvent.inLogs(paidInvoice,
                `InvoiceAdded`,
                {
                    contractId: new BN(CONTRACT_1),
                    invoiceId: new BN(INVOICE_ID_1),
                    invoiceStatus: new BN(InvoiceStatus.Paid)
                }
            );

            let details = await this.digitalOracles.getContractInvoiceDetails(INVOICE_ID_1);
            details.invoiceStatus.should.be.bignumber.eq(InvoiceStatus.Paid.toString());
            details.contractId.should.be.bignumber.eq(CONTRACT_1.toString());

            const {logs: delayedInvoice} = await this.digitalOracles.addInvoiceToContract(CONTRACT_1, INVOICE_ID_2, InvoiceStatus.Delayed);
            expectEvent.inLogs(delayedInvoice,
                `InvoiceAdded`,
                {
                    contractId: new BN(CONTRACT_1),
                    invoiceId: new BN(INVOICE_ID_2),
                    invoiceStatus: new BN(InvoiceStatus.Delayed)
                }
            );

            details = await this.digitalOracles.getContractInvoiceDetails(INVOICE_ID_2);
            details.invoiceStatus.should.be.bignumber.eq(InvoiceStatus.Delayed.toString());
            details.contractId.should.be.bignumber.eq(CONTRACT_1.toString());

            const invoiceIds = await this.digitalOracles.getContractInvoices(CONTRACT_1);
            invoiceIds.map(i => i.toString()).should.be.deep.eq([
                INVOICE_ID_1.toString(),
                INVOICE_ID_2.toString()
            ]);
        });
    });

});
