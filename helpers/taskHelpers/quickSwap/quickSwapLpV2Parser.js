const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const addLiquidity = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    tokenA: txnArgs[0],
    tokenB: txnArgs[1],
    amountADesired: txnArgs[2].toString(),
    amountBDesired: txnArgs[3].toString(),
    amountAMin: txnArgs[4].toString(),
    amountBMin: txnArgs[5].toString(),
    to: txnArgs[6],
    deadline: txnArgs[7].toString(),
  };

  data.tokenAUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokenA, data.amountADesired, 0);
  data.tokenBUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokenB, data.amountBDesired, 0);

  data.amountUsd = data.tokenAUsd.tokenValue + data.tokenBUsd.tokenValue;
  if (data.to != ethers.constants.AddressZero) data.realFrom = data.to;

  const finalData = {
    amountUsd: data.amountUsd,
    tag: enums.TaskTag.deposit,
    realFrom: data.realFrom,
  };

  return finalData;
};

const addLiquidityETH = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    token: txnArgs[0],
    amountTokenDesired: txnArgs[1].toString(),
    amountTokenMin: txnArgs[2].toString(),
    amountETHMin: txnArgs[3].toString(),
    to: txnArgs[4],
    deadline: txnArgs[5].toString(),
  };

  data.ethUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.WETH[txn.chainId], data.amountETHMin, 0);
  data.tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.token, data.amountTokenDesired, 0);

  data.amountUsd = data.ethUsd.tokenValue + data.tokenUsd.tokenValue;
  if (data.to != ethers.constants.AddressZero) data.realFrom = data.to;

  const finalData = {
    amountUsd: data.amountUsd,
    tag: enums.TaskTag.deposit,
    realFrom: data.realFrom,
  };

  return finalData;
};

module.exports = {
  addLiquidity,
  addLiquidityETH,
};
