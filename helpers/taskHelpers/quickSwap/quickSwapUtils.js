const { ethers } = require("ethers");
const { abi } = require("../../../constants");
const { getProvider } = require("../../ethersHelper");

const getTokenFromQuickSwapPool = async (poolAddress, chainId, tokenIndex) => {
  const pool = new ethers.Contract(poolAddress, abi.quickSwapMultiPositionLiquidityManager, getProvider(chainId));
  const token = await pool[`token${tokenIndex}`]();
  return token;
};

const getQuickTokenAddress = async (poolAddress, chainId) => {
  const pool = new ethers.Contract(poolAddress, abi.quickSwapDragonLairAbi, getProvider(chainId));
  const token = await pool.quick();
  return token;
};

module.exports = {
  getTokenFromQuickSwapPool,
  getQuickTokenAddress,
};
