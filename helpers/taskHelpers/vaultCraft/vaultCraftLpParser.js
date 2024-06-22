const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const joinPool = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    poolId: txnArgs[0],
    // sender: txnArgs[1],
    recipient: txnArgs[2],
    assets: txnArgs[3][0].map((item) => item.toString()),
    // maxAmountsIn: txnArgs[3][1].map((item) => item.toString()),
    // userData: txnArgs[3][2],
    // fromInternalBalance: txnArgs[3][3],
  };

  // const token0Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.assets[0], data.maxAmountsIn[0], 0);
  // const token1Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.assets[1], data.maxAmountsIn[0], 0);

  // data.token0Usd = token0Usd.tokenUsd;
  // data.token1Usd = token1Usd.tokenUsd;
  // data.token0Value = token0Usd.tokenValue;
  // data.token1Value = token1Usd.tokenValue;
  // data.amountUsd = token0Usd.tokenValue + token1Usd.tokenValue;

  data.realFrom = data.recipient;

  data.tag = enums.TaskTag.lp;

  return data;
};

const batchSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    // kind: txnArgs[0],
    poolId: txnArgs.swaps[0][0],
    // sender: txnArgs.funds[0],
    recipient: txnArgs.funds[2],
    amount: txnArgs.swaps[0][3].toString(),
    // fromInternalBalance: txnArgs.funds[1],
  };

  data.realFrom = data.recipient;

  data.tag = enums.TaskTag.swap;

  return data;
};

const singleSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    // kind: txnArgs[0],
    poolId: txnArgs.swaps[0][0],
    // sender: txnArgs.funds[0],
    recipient: txnArgs.funds[2],
    amount: txnArgs.swaps[0][3].toString(),
    // fromInternalBalance: txnArgs.funds[1],
  };

  data.realFrom = data.recipient;

  data.tag = enums.TaskTag.swap;

  return data;
};

module.exports = {
  joinPool,
  batchSwap,
  singleSwap,
};
