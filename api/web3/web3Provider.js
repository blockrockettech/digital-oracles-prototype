const Web3 = require('web3');

const INFURA_KEY = '793e122121c64b69981c571a888c6271';

let httpProviderWeb3 = {};
let webSocketWeb3 = {};

module.exports.webSocket = function (network) {
    if (webSocketWeb3[network]) {
        return webSocketWeb3[network];
    }
    webSocketWeb3[network] = new Web3(new Web3.providers.WebsocketProvider(`wss://${network}.infura.io/ws/v3/${INFURA_KEY}`));
    return webSocketWeb3[network];
};

module.exports.httpProvider = function (network) {
    if (httpProviderWeb3[network]) {
        return httpProviderWeb3[network];
    }
    httpProviderWeb3[network] = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${INFURA_KEY}`));
    return httpProviderWeb3[network];
};
