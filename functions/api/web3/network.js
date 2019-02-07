
const networkSplitter = (network, {ropsten, rinkeby, mainnet, local}) => {
    switch (network) {
        case 1:
        case '1':
        case 'mainnet':
            return mainnet;
        case 3:
        case '3':
        case 'ropsten':
            return ropsten;
        case 4:
        case '4':
        case 'rinkeby':
            return rinkeby;
        case 5777:
        case '5777':
        case 'local':
            // This may change if a clean deploy of KODA locally is not done
            return local;
        default:
            throw new Error(`Unknown network ID ${network}`);
    }
};

const getAddress = (network) => {
    return networkSplitter(network, {
        mainnet: '',
        ropsten: '0xae7FD5f460ff90fDCB86963De4c3ddDd237614aD',
        rinkeby: '',
        local: '0x5501d4c6aBD37091B223Ea319380b0A4762C6Eb2' // <- UPDATE THIS WITH YOUR LOCALLY INSTALLED GANACHE VERSION
    });
};

const getNetwork = (network) => {
    return networkSplitter(network, {
        mainnet: 1,
        ropsten: 3,
        rinkeby: 4,
        local: 5777
    });
};

const getNetworkName = (network) => {
    return networkSplitter(network, {
        mainnet: 'mainnet',
        ropsten: 'ropsten',
        rinkeby: 'rinkeby',
        local: 'local'
    });
};

module.exports = {
    getAddress,
    getNetworkName,
    getNetwork
};

