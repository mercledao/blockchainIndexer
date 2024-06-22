const { external, api, dateMillis, misc } = require("../../constants");
const { get } = require("../network");
const cacheHelper = require("../cacheHelper");
const utils = require("../utils");
const { ethers } = require("ethers");

// The price of the token that is used to pay gas on the particular network
//eg : eth on etherum and matic on polygon
const _getGasEthPrice = async (chainId) => {
  const coinGeckoSymbolId = external.coingecko.symbolToId[misc.gasToken[chainId].name];
  const priceDetails = await get(api.coingecko.getPriceSimple(coinGeckoSymbolId));
  return priceDetails?.[coinGeckoSymbolId]?.usd;
};

const _getUsdPrice = async (chainId, tokenAddress) => {
  if (tokenAddress == misc.gasToken[chainId]?.usdAddress || tokenAddress == misc.gasToken[chainId]?.daiAddress)
    return 1;

  const coingeckoChainId = external.coingecko.chainId[chainId];
  const coinDetails = await get(api.coingecko.getTokenInfo(coingeckoChainId, tokenAddress));
  const usdPrice = coinDetails.market_data.current_price.usd;

  return usdPrice;
};

const getUsdPriceOf = async ({ chainId, tokenAddress }) => {
  try {
    const cacheKey = utils.hashObject({
      chainId,
      tokenAddress,
      func: "coingecko::getUsdPriceOf",
    });
    const cached = await cacheHelper.getDataJson(cacheKey);
    if (cached) return cached;

    let usdPrice = 0;
    if (tokenAddress == misc.ETH || tokenAddress == ethers.constants.AddressZero) {
      usdPrice = await _getGasEthPrice(chainId);
    } else {
      usdPrice = await _getUsdPrice(chainId, tokenAddress);
    }

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
