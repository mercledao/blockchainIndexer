const { ethers } = require("ethers");
const ethersHelper = require("../../ethersHelper");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const IdleTokenTrancheAbi = require("../../../abi/idleFinance/IdleTokenTrancheAbi.json");

const mintIdleToken = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    amount: txnArgs[0].toString(),
    skipRebalance: txnArgs[1],
    referral: txnArgs[2],
  };

  const tranche = new ethers.Contract(txn.to, IdleTokenTrancheAbi, ethersHelper.getProvider(txn.chainId));
  data.tokenAddress = await tranche.token();

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokenAddress, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

module.exports = { mintIdleToken };
