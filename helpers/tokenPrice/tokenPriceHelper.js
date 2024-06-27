const { ethers } = require("ethers");
const ethersHelper = require("../ethersHelper");
const zeroXHelper = require("./zeroXHelper");
const coingeckoHelper = require("./coingeckoHelper");
const pythHelper = require("./pythHelper");
const priceIndexer = require("./priceIndexerHelper");
const { misc } = require("../../constants");

const getUsdPriceOf = async ({ chainId, tokenAddress }) => {
  if (
    tokenAddress == misc.gasToken[chainId]?.usdAddress ||
    tokenAddress == misc.gasToken[chainId]?.daiAddress
  )
    return 1;
  const result = await priceIndexer.getUsdPrice(chainId, tokenAddress);
  if (result) {
    return result?.price;
  }
  if (chainId != 100 && chainId != 5000 && chainId != 8453) {
    try {
      return await coingeckoHelper.getUsdPriceOf({ chainId, tokenAddress });
    } catch (e) {
      return await zeroXHelper.getUsdPriceOf({ chainId, tokenAddress });
    }
  } else {
    /**
     * priorities coingeck over pyth as it supports greater number of tokens.
     * pyth will fuzzy search and return values so it will not be correct all the time.
     * eg, fxdx doesn't exist in pyth so it matches with dydx
     */
    const p = await coingeckoHelper.getUsdPriceOf({ chainId, tokenAddress });
    if (p) return p;
    if (chainId == 5000 || chainId == 8453) {
      return await pythHelper.getUsdPriceOf({ chainId, tokenAddress });
    }
    // mostly returns 0
    return p;
  }
};

const getTradeUsd = async (txn, tokenAddress, sellAmount) => {
  try {
    const tokenUsd = await getUsdPriceOf({
      chainId: txn.chainId,
      tokenAddress: tokenAddress,
    });
    const decimals = await ethersHelper.getDecimals(tokenAddress, txn.chainId);
    const sellAmountFormatted = ethers.utils.formatUnits(sellAmount, decimals);

    return { tokenUsd, tokenValue: tokenUsd * sellAmountFormatted };
  } catch (e) {
    console.error(
      `_getTradeUsd::${txn.chainId}::${txn.hash}::${tokenAddress}::${sellAmount}`,
      e
    );
    throw e;
  }
};

const getTradeUsdTry = async (
  txn,
  tokenAddress,
  sellAmount,
  defaultValue = Infinity
) => {
  try {
    return await getTradeUsd(txn, tokenAddress, sellAmount);
  } catch (e) {
    console.error(`getTradeUsdTry::${txn.hash}::${txn.chainId}`, e);
    return { tokenUsd: 0, tokenValue: defaultValue };
  }
};

module.exports = { getUsdPriceOf, getTradeUsd, getTradeUsdTry };
