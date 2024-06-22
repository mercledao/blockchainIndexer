const { ethers } = require("ethers");
const { EvmPriceServiceConnection } = require("@pythnetwork/pyth-evm-js");
const { abi, external, dateMillis } = require("../../constants");
const { getProvider, getSymbol } = require("../ethersHelper");
const cacheHelper = require("../cacheHelper");
const utils = require("../utils");
const Fuse = require("fuse.js");

const connection = new EvmPriceServiceConnection("https://hermes.pyth.network");

const fuse = new Fuse(Object.keys(external.pyth));

const searchPriceId = (symbol) => {
  const v = fuse.search(`${symbol.toLowerCase()}/usd`)?.[0]?.item;
  return external.pyth[v];
};

/**
 * This may not be correct 100% of the time but should be good enough if the communities we're working with are credible.
 * Get the token address from the contract and then get price from the symbol.
 * Some fake tokens may have the same symbol which will give incorrect value.
 * But as long as the communities are credible, it should be of less priority
 */
const getUsdPriceOf = async ({ chainId, tokenAddress }) => {
  try {
    const cacheKey = utils.hashObject({ chainId, tokenAddress, func: "pyth::getUsdPriceOf" });
    const cached = await cacheHelper.getDataJson(cacheKey);
    if (cached) return cached;

    const symbol = (await getSymbol(tokenAddress, chainId)).toLowerCase().trim();

    const priceId = searchPriceId(symbol);
    if (!priceId) throw new Error(`${symbol} chainId:${chainId} tokenAddress:${tokenAddress} not mapped pyth`);

    const priceIds = [priceId];
    const priceFeeds = await connection.getLatestPriceFeeds(priceIds);

    const priceDetails = priceFeeds[0].getPriceNoOlderThan(60);
    const usdPrice = priceDetails.price * 10 ** priceDetails.expo;

    if (!utils.isNumeric(usdPrice)) throw new Error("Not a number");

    cacheHelper.setDataJson(cacheKey, usdPrice, dateMillis.hour_1);

    return usdPrice;
  } catch (e) {
    console.error(e);
  }

  return 0;
};

module.exports = {
  getUsdPriceOf,
};
