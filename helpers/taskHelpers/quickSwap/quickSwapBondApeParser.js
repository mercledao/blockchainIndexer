const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const ethersHelper = require("../../ethersHelper");
const { enums, abi } = require("../../../constants");

const deposit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    _amount: txnArgs[0].toString(),
    _maxPrice: txnArgs[1].toString(),
    _depositor: txnArgs[2],
  };

  const billContract = new ethers.Contract(
    txn.to,
    abi.quickswapBondCustomBillRefillableAbi,
    ethersHelper.getProvider(txn.chainId)
  );

  data.token = await billContract.principalToken();
  data.tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.token, data._amount, 0);
  data.amountUsd = data.tokenUsd.tokenValue;

  const finalData = {
    amountUsd: data.amountUsd,
    tag: enums.TaskTag.bond,
  };
  return finalData;
};

module.exports = {
  deposit,
};
