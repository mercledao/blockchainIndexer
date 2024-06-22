const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const simpleSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args[0];

  const data = {
    fromToken: txnArgs[0],
    // toToken: txnArgs[1],
    fromAmount: txnArgs[2].toString(),
    // toAmount: txnArgs[3].toString(),
    // expectedAmount: txnArgs[4].toString(),
    // callees: txnArgs[5],
    // exchangeData: txnArgs[6].toString(),
    // startIndexes: txnArgs[7].map((item) => item.toString()),
    // values: txnArgs[8].map((item) => item.toString()),
    // beneficiary: txnArgs[9],
    // partner: txnArgs[10],
    // feePercent: txnArgs[11].toString(),
    // permit: txnArgs[12],
    // deadline: txnArgs[13].toString(),
    // uuid: txnArgs[14].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.fromToken, data.fromAmount, 0);

  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  if (txnArgs[9] != ethers.constants.AddressZero) data.realFrom = txnArgs[9];

  data.tag = enums.TaskTag.swap;

  return data;
};

const simpleBuy = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args[0];

  const data = {
    fromToken: txnArgs[0],
    // toToken: txnArgs[1],
    fromAmount: txnArgs[2].toString(),
    // toAmount: txnArgs[3].toString(),
    // expectedAmount: txnArgs[4].toString(),
    // callees: txnArgs[5],
    // exchangeData: txnArgs[6].toString(),
    // startIndexes: txnArgs[7].map((item) => item.toString()),
    // values: txnArgs[8].map((item) => item.toString()),
    // beneficiary: txnArgs[9],
    // partner: txnArgs[10],
    // feePercent: txnArgs[11].toString(),
    // permit: txnArgs[12],
    // deadline: txnArgs[13].toString(),
    // uuid: txnArgs[14].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.fromToken, data.fromAmount, 0);

  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  if (txnArgs[9] != ethers.constants.AddressZero) data.realFrom = txnArgs[9];

  data.tag = enums.TaskTag.swap;

  return data;
};

module.exports = {
  simpleSwap,
  simpleBuy,
};
