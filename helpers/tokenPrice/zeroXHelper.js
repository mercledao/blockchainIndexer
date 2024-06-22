const { external, api, dateMillis, misc } = require("../../constants");
const { getZeroX, get } = require("../network");
const cacheHelper = require("../cacheHelper");
const utils = require("../utils");
const { ethers } = require("ethers");

const _getUsdPrice = async (chainId, tokenAddress) => {
  try {
    if (tokenAddress == misc.gasToken[chainId]?.usdAddress || tokenAddress == misc.gasToken[chainId]?.daiAddress)
      return 1;

    const coinDetails = await getZeroX(api.zeroX.getUsdTokenPrice(chainId, tokenAddress));
    const usdPrice = 1 / coinDetails.price;

    if (utils.isNumeric(usdPrice)) return usdPrice;
    throw new Error("Not a number");
  } catch (e) {
    const tokenPriceInGas = (await getZeroX(api.zeroX.getTokenPriceInGas(chainId, tokenAddress))).price;
    const gasInUsd = (await getZeroX(api.zeroX.getUsdGasPrice(chainId))).price;
    const tokenUsd = 1 / (tokenPriceInGas * gasInUsd);

    return utils.isNumeric(tokenUsd) ? tokenUsd : 0;
  }
};

const getUsdPriceOf = async ({ chainId, tokenAddress }) => {
  try {
    const cacheKey = utils.hashObject({ chainId, tokenAddress, func: "zeroX::getUsdPriceOf" });
    const cached = await cacheHelper.getDataJson(cacheKey);
    if (cached) return cached;

    let _chainId = chainId;
    let _tokenAddress = tokenAddress;
    if (tokenAddress == misc.ETH || tokenAddress == ethers.constants.AddressZero) {
      _chainId = chainId;
      _tokenAddress = misc.gasToken[chainId].name;
    }

    const usdPrice = await _getUsdPrice(_chainId, _tokenAddress);

    cacheHelper.setDataJson(cacheKey, usdPrice, dateMillis.hour_1);

    return usdPrice;
  } catch (e) {
    console.error(
      `getUsdPriceOf::${chainId}::${tokenAddress}::${api.coingecko.getTokenInfo(
        external.coingecko.chainId[chainId],
        tokenAddress
      )}`,
      e
    );
  }
  return 0;
};

module.exports = {
  getUsdPriceOf,
};
