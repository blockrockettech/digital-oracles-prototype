const DigitalOracles = artifacts.require("./DigitalOracles.sol");

module.exports = async function (deployer) {
    await deployer.deploy(DigitalOracles);

    const digitalOracles = await DigitalOracles.deployed();

    const APPROVED = 0;
    const REJECTED = 1;

    const CONSULTING = 1;
    const SASS = 2;
    const SOFTWARE_DEV = 3;

    // Setup three sample contract types
    await digitalOracles.createContractType(CONSULTING, 'consulting', true);
    await digitalOracles.createContractType(SASS, 'SAAS', true);
    await digitalOracles.createContractType(SOFTWARE_DEV, 'Software Development', true);

    const MR_A = 1;
    const MRS_B = 2;
    const MISS_C = 3;
    const DR_D = 4;

    // Setup 4 sample parties
    await digitalOracles.createParty(MR_A, 'Mr. A', true);
    await digitalOracles.createParty(MRS_B, 'Mrs. B', true);
    await digitalOracles.createParty(MISS_C, 'Miss. C', true);
    await digitalOracles.createParty(DR_D, 'Dr. D', true);

    const CONTRACT_NEW_SITE = 1;
    const CONTRACT_INSTALL = 2;
    const CONTRACT_YEARLY_MEMBERSHIP = 3;

    // Create 3 sample contracts
    await digitalOracles.createContract(CONTRACT_NEW_SITE, 'New website', SOFTWARE_DEV, MISS_C, MR_A);
    await digitalOracles.createContract(CONTRACT_INSTALL, 'Installation', CONSULTING, DR_D, MRS_B);
    await digitalOracles.createContract(CONTRACT_YEARLY_MEMBERSHIP, '1 year membership', CONSULTING, DR_D, MR_A);

    // Part approve one of them
    await digitalOracles.settleContract(CONTRACT_INSTALL, DR_D, APPROVED);

    // Part reject one of them
    await digitalOracles.settleContract(CONTRACT_YEARLY_MEMBERSHIP, MR_A, REJECTED);

};
