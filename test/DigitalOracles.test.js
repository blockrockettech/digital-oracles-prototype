const _ = require('lodash');
const DigitalOracles = artifacts.require('DigitalOracles');
const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('DigitalOracles tests', function (accounts) {

    const _owner = accounts[0];

    const State = {Blank: 0, Pending: 1, Approved: 2, Terminated: 3};

    const PARTY_A = 1;
    const PARTY_B = 2;
    const PARTY_C = 3;

    const CONTRACT_1 = 1;
    const CONTRACT_2 = 2;
    const CONTRACT_3 = 3;

    const INVOICE_ID_1 = 1;
    const INVOICE_ID_2 = 2;
    const INVOICE_ID_3 = 3;

    beforeEach(async function () {
        this.digitalOracles = await DigitalOracles.new({from: _owner});
    });

    context('validation', async function () {

    });

    context('basic contract workflow', async function () {

        it("basic approval without invoice", async function () {

            const {logs: creationLogs} = await this.digitalOracles.createContract(CONTRACT_1, PARTY_A);
            expectEvent.inLogs(creationLogs,
                `ContractCreated`,
                {
                    contractId: new BN(CONTRACT_1),
                    partyA: new BN(PARTY_A)
                }
            );

            const {creationDate, partyA, state, contractData, invoiceIds} = await this.digitalOracles.getContract(CONTRACT_1);
            partyA.should.be.bignumber.eq(PARTY_A.toString());
            state.should.be.bignumber.eq(State.Pending.toString());
            contractData.should.be.eq('0x0000000000000000000000000000000000000000000000000000000000000000');
            invoiceIds.should.be.deep.eq([]);
            creationDate.should.not.be.null;

            const {logs: approvalLogs} = await this.digitalOracles.approveContract(CONTRACT_1, PARTY_B, web3.utils.asciiToHex("an-ipfs-hash"));
            expectEvent.inLogs(approvalLogs,
                `ContractApproved`,
                {
                    contractId: new BN(CONTRACT_1),
                    contractData: "0x616e2d697066732d686173680000000000000000000000000000000000000000" // bytes32 of IPFS hash
                }
            );

            const {
                creationDate: expectedCreationDate,
                partyA: expectPartyA,
                partyB: expectPartyB,
                state: expectedState,
                contractData: expectedContractData,
                invoiceIds: expectedInvoiceIds
            } = await this.digitalOracles.getContract(CONTRACT_1);

            expectedState.should.be.bignumber.eq(State.Approved.toString());
            expectedContractData.should.be.eq('0x616e2d697066732d686173680000000000000000000000000000000000000000');
            expectedInvoiceIds.should.be.deep.eq([]);
            expectPartyA.should.be.bignumber.eq(PARTY_A.toString());
            expectPartyB.should.be.bignumber.eq(PARTY_B.toString());
            expectedCreationDate.should.not.be.null;

        });

        it("basic approval with invoice and IPFS hash", async function () {

            const {logs: creationLogs} = await this.digitalOracles.createContract(CONTRACT_1, PARTY_A);
            expectEvent.inLogs(creationLogs,
                `ContractCreated`,
                {
                    contractId: new BN(CONTRACT_1),
                    partyA: new BN(PARTY_A)
                }
            );
            const {state} = await this.digitalOracles.getContract(CONTRACT_1);
            state.should.be.bignumber.eq(State.Pending.toString());

            const {logs: approvalLogs} = await this.digitalOracles.approveContract(CONTRACT_1, PARTY_B, web3.utils.asciiToHex("an-ipfs-hash"), INVOICE_ID_1);
            expectEvent.inLogs(approvalLogs,
                `ContractApproved`,
                {
                    contractId: new BN(CONTRACT_1),
                    contractData: "0x616e2d697066732d686173680000000000000000000000000000000000000000" // bytes32 of IPFS hash
                }
            );

            const {
                creationDate: expectedCreationDate,
                partyA: expectPartyA,
                partyB: expectPartyB,
                state: expectedState,
                contractData: expectedContractData,
                invoiceIds: expectedInvoiceIds
            } = await this.digitalOracles.getContract(CONTRACT_1);

            expectedState.should.be.bignumber.eq(State.Approved.toString());
            expectedContractData.should.be.eq('0x616e2d697066732d686173680000000000000000000000000000000000000000');
            expectedInvoiceIds.map(i => i.toString()).should.be.deep.eq([
                INVOICE_ID_1.toString()
            ]);
            expectPartyA.should.be.bignumber.eq(PARTY_A.toString());
            expectPartyB.should.be.bignumber.eq(PARTY_B.toString());
            expectedCreationDate.should.not.be.null;
        });

        it('rejection of contract', async function () {
            const {logs: creationLogs} = await this.digitalOracles.createContract(CONTRACT_1, PARTY_A);
            expectEvent.inLogs(creationLogs,
                `ContractCreated`,
                {
                    contractId: new BN(CONTRACT_1),
                    partyA: new BN(PARTY_A)
                }
            );
            const {state} = await this.digitalOracles.getContract(CONTRACT_1);
            state.should.be.bignumber.eq(State.Pending.toString());

            const {logs: rejectionLogs} = await this.digitalOracles.terminateContract(CONTRACT_1);
            expectEvent.inLogs(rejectionLogs,
                `ContractTerminated`,
                {
                    contractId: new BN(CONTRACT_1)
                }
            );
        });

        it('adding an invoice to a contract', async function () {
            await this.digitalOracles.createContract(CONTRACT_1, PARTY_A);
            const {state} = await this.digitalOracles.getContract(CONTRACT_1);
            state.should.be.bignumber.eq(State.Pending.toString());

            await this.digitalOracles.approveContract(CONTRACT_1, PARTY_B, web3.utils.asciiToHex("an-ipfs-hash"), INVOICE_ID_1);
            const {state: newState} = await this.digitalOracles.getContract(CONTRACT_1);
            newState.should.be.bignumber.eq(State.Approved.toString());

            await this.digitalOracles.addInvoiceToContract(CONTRACT_1, INVOICE_ID_2);
            const {invoiceIds} = await this.digitalOracles.getContract(CONTRACT_1);
            invoiceIds.map(i => i.toString()).should.be.deep.eq([
                INVOICE_ID_1.toString(),
                INVOICE_ID_2.toString()
            ]);
        });
    });

});
