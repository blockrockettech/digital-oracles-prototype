const axios = require('axios');

class GasPriceService {
    async getGasPrice() {
        const result = await axios.get('https://www.etherchain.org/api/gasPriceOracle');
        return Math.round(result.data.standard);
    }
}

module.exports = new GasPriceService();
