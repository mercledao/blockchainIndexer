const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");
const { getQuickTokenAddress } = require("./quickSwapUtils");

const enter = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    // _quickAmount: txnArgs[0].toString(),
    // v: txn.v,
    // r: txn.r,
    // s: txn.s,
  };

  const tokenAddress = await getQuickTokenAddress(txn.to, txn.chainId);

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, tokenAddress, txnArgs[0].toString(), 0);

  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.stake;

  return data;
};

module.exports = {
  enter,
};
