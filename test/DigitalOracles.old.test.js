const _ = require('lodash');
const DigitalOracles = artifacts.require('DigitalOracles');

contract.skip('DigitalOracles old tests', function (accounts) {

    const _owner = accounts[0];

    const PENDING = 0;
    const APPROVED = 1;
    const REJECTED = 2;

    const CONSULTING = 1;
    const SASS = 2;
    const SOFTWARE_DEV = 3;

    const MR_A = 1;
    const MRS_B = 2;
    const MISS_C = 3;
    const DR_D = 4;

    const CONTRACT_NEW_SITE = 1;
    const CONTRACT_INSTALL = 2;
    const CONTRACT_YEARLY_MEMBERSHIP = 3;

    beforeEach(async function () {

        // Create contracts
        this.digitalOracles = await DigitalOracles.new({from: _owner});

        // Setup three sample contract types
        await this.digitalOracles.createContractType(CONSULTING, 'consulting', true);
        await this.digitalOracles.createContractType(SASS, 'SAAS', true);
        await this.digitalOracles.createContractType(SOFTWARE_DEV, 'Software Development', true);

        // Setup 4 sample parties
        await this.digitalOracles.createParty(MR_A, 'Mr. A', true);
        await this.digitalOracles.createParty(MRS_B, 'Mrs. B', true);
        await this.digitalOracles.createParty(MISS_C, 'Miss. C', true);
        await this.digitalOracles.createParty(DR_D, 'Dr. D', true);

        // Create 3 sample contracts
        await this.digitalOracles.createContract(CONTRACT_NEW_SITE, 'New website', SOFTWARE_DEV, MISS_C, MR_A);
        await this.digitalOracles.createContract(CONTRACT_INSTALL, 'Installation', CONSULTING, DR_D, MRS_B);
        await this.digitalOracles.createContract(CONTRACT_YEARLY_MEMBERSHIP, '1 year membership', CONSULTING, DR_D, MR_A);

        // Part approve one of them
        await this.digitalOracles.settleContract(CONTRACT_INSTALL, DR_D, APPROVED);

        // Part reject one of them
        await this.digitalOracles.settleContract(CONTRACT_YEARLY_MEMBERSHIP, MR_A, REJECTED);
    });

    describe('contract types', async function () {
        it("can query for consulting data", async function () {
            const contractType = await this.digitalOracles.getContractType.call(CONSULTING);
            assert.equal(contractType.id, CONSULTING);
            assert.notEqual(contractType.creationDate, null);
            assert.equal(contractType.name, 'consulting');
            assert.equal(contractType.active, true);
        });

        it("can query for consulting data", async function () {
            const contractType = await this.digitalOracles.getContractType.call(SOFTWARE_DEV);
            assert.equal(contractType.id, SOFTWARE_DEV);
            assert.notEqual(contractType.creationDate, null);
            assert.equal(contractType.name, 'Software Development');
            assert.equal(contractType.active, true);
        });
    });

    describe('parties', async function () {
        it("can query for a party", async function () {
            const party = await this.digitalOracles.getParty.call(MR_A);
            assert.equal(party.id, MR_A);
            assert.notEqual(party.creationDate, null);
            assert.equal(party.name, 'Mr. A');
            assert.equal(party.active, true);
        });
    });

    describe('contracts', async function () {
        it("can query for contracts", async function () {
            const party = await this.digitalOracles.getContract.call(CONTRACT_INSTALL);
            assert.equal(party.id, CONTRACT_INSTALL);
            assert.notEqual(party.creationDate, null);
            assert.equal(party.name, 'Installation');
            assert.equal(party.contractType, CONSULTING);
            assert.equal(party.partyA, DR_D);
            assert.equal(party.partyB, MRS_B);
            assert.equal(party.active, true);
        });
    });

    describe('settlement', async function () {
        it("can query for settlement", async function () {
            const settlement = await this.digitalOracles.getSettlement.call(CONTRACT_INSTALL);

            assert.equal(settlement.state, PENDING);
            assert.notEqual(settlement.updateDatetime, null);

            assert.equal(settlement.partyA, DR_D);
            assert.equal(settlement.partyAState, APPROVED);
            assert.notEqual(settlement.partyAUpdateDatetime, null);

            assert.equal(settlement.partyB, MRS_B);
            assert.equal(settlement.partyBState, PENDING);
            assert.equal(settlement.partyBUpdateDatetime, 0);
        });
    });

});
