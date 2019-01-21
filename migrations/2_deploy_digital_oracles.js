const DigitalOracles = artifacts.require("./DigitalOracles.sol");

module.exports = async function(deployer) {
  await deployer.deploy(DigitalOracles);
};
