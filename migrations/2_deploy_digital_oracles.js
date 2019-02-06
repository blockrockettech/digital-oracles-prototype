const DigitalOracles = artifacts.require("./DigitalOraclesOld.sol");
const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../api/const');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(require('../mnemonic'), `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    await deployer.deploy(DigitalOracles, {from: _owner});
};
