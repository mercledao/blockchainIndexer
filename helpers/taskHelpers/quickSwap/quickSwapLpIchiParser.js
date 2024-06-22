const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums } = require("../../../constants");

const forwardDepositToICHIVault = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    vault: txnArgs[0],
    vaultDeployer: txnArgs[1],
    token: txnArgs[2],
    amount: txnArgs[3].toString(),
    minimumProceeds: txnArgs[4].toString(),
    to: txnArgs[5],
  };

  data.token = await tokenPriceHelper.getTradeUsdTry(txn, data.token, data.amount, 0);
  data.amountUsd = data.token.tokenValue;

  if (data.to != ethers.constants.AddressZero) data.realFrom = data.to;

  const finalData = {
    amountUsd: data.amountUsd,
    tag: enums.TaskTag.deposit,
    realFrom: data.realFrom,
  };

  return finalData;
};

module.exports = {
  forwardDepositToICHIVault,
};
