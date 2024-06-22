const { ethers } = require("ethers");
const ethersHelper = require("../../ethersHelper");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const IdleTokenTrancheAbi = require("../../../abi/idleFinance/IdleTokenTrancheAbi.json");

const depositAA = async ({ txn }) => {
  return await _deposit({ txn });
};

const depositBB = async ({ txn }) => {
  return await _deposit({ txn });
};

const _deposit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // cdo: txnArgs[0],
    // amount: txnArgs[1].toString(),
  };

  const tranche = new ethers.Contract(txnArgs[0], IdleTokenTrancheAbi, ethersHelper.getProvider(txn.chainId));
  const tokenAddress = await tranche.token();

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, tokenAddress, txnArgs[1].toString());
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

module.exports = { depositAA, depositBB };
