const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '';

// Check gas prices before live deploy - https://ethgasstation.info/

module.exports = {
  mocha: {
    useColors: true,
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 3
    }
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
  }
};
