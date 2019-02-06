const Web3 = require('web3');

const {INFURA_KEY} = require('../../const');

let httpProviderWeb3 = {};
let webSocketWeb3 = {};

const webSocket = (network) => {
    if (webSocketWeb3[network]) {
        return webSocketWeb3[network];
    }

    if (network === 5777) {
        webSocketWeb3[network] = new Web3(new Web3.providers.WebsocketProvider(`ws://localhost:7545`));
    } else {
        webSocketWeb3[network] = new Web3(new Web3.providers.WebsocketProvider(`wss://${network}.infura.io/ws/v3/${INFURA_KEY}`));
    }

    return webSocketWeb3[network];
};

const httpProvider = (network) => {
    if (httpProviderWeb3[network]) {
        return httpProviderWeb3[network];
    }

    if (network === 5777) {
        httpProviderWeb3[network] = new Web3(new Web3.providers.HttpProvider(`http://127.0.0.1:7545`));
    } else {
        httpProviderWeb3[network] = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${INFURA_KEY}`));
    }

    return httpProviderWeb3[network];
};

module.exports = {
    httpProvider,
    webSocket
};
