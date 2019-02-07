const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('./functions/const');

module.exports = {
  mocha: {
    useColors: true
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 1
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(require('./mnemonic'), `https://ropsten.infura.io/v3/${INFURA_KEY}`);
      },
      network_id: 3,
      gas: 7000000, // default = 4712388
      gasPrice: 4000000000, // default = 100 gwei = 100000000000
      skipDryRun: true
    },
  }
};
