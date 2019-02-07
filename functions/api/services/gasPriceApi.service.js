const axios = require('axios');
const {MAX_GAS_PRICE} = require("../../const");

class GasPriceService {
    async getGasPrice() {
        const result = await axios.get('https://www.etherchain.org/api/gasPriceOracle');
        return Math.round(result.data.standard);
    }

    isOverThreshold(price) {
        return price > MAX_GAS_PRICE;
    }
}

module.exports = new GasPriceService();
