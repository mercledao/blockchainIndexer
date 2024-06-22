const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const depositDAI = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    daiAmount: txnArgs[0].toString(),
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.gasToken[1].usdAddress, data.daiAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositETH = async ({ txn }) => {
  const data = {
    ethAmount: txn.value.toString(),
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.ETH, data.ethAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositStETH = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    stETHAmount: txnArgs[0].toString(),
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.ETH, data.stETHAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositUSDC = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    usdcAmount: txnArgs[0].toString(),
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.gasToken[1].usdAddress, data.usdcAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositUSDT = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    usdtAmount: txnArgs[0].toString(),
    // minDAIAmount: txnArgs[1].toString(),
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.gasToken[1].usdAddress, data.usdtAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositStETHWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    stETHAmount: txnArgs[0].toString(),
    // allowance: txnArgs[1].toString(),
    // deadline: txnArgs[2].toString(),
    // v: parseInt(txnArgs[3].toString()),
    // r: txnArgs[4],
    // s: txnArgs[5],
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.ETH, data.stETHAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositDAIWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    daiAmount: txnArgs[0].toString(),
    // nonce: txnArgs[1].toString(),
    // expiry: txnArgs[2].toString(),
    // v: parseInt(txnArgs[3].toString()),
    // r: txnArgs[4],
    // s: txnArgs[5],
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.gasToken[1].usdAddress, data.daiAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

const depositUSDCWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    usdcAmount: txnArgs[0].toString(),
    // allowance: txnArgs[1].toString(),
    // deadline: txnArgs[2].toString(),
    // v: parseInt(txnArgs[3].toString()),
    // r: txnArgs[4],
    // s: txnArgs[5],
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.gasToken[1].usdAddress, data.usdcAmount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.deposit;

  return data;
};

module.exports = {
  depositDAI,
  depositETH,
  depositStETH,
  depositUSDC,
  depositUSDT,
  depositStETHWithPermit,
  depositDAIWithPermit,
  depositUSDCWithPermit,
};
