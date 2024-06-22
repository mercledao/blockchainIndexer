const { ethers } = require("ethers");
const { misc, api } = require("../../constants");
const { getPriceIndexer } = require("../network");

const getUsdPrice = async (chainId, tokenAddress) => {
  if (
    tokenAddress == misc.gasToken[chainId]?.usdAddress ||
    tokenAddress == misc.gasToken[chainId]?.daiAddress
  )
    return 1;
  try {
    if (
      tokenAddress === misc.WETH[chainId] ||
      tokenAddress === misc.ETH ||
      tokenAddress === ethers.constants.AddressZero
    ) {
      const response = await getPriceIndexer(api.priceIndexer("ETH"));
      return await response;
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  getUsdPrice,
};
