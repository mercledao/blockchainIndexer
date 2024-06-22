const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const ethersHelper = require("../../ethersHelper");
const { enums, misc } = require("../../../constants");
const vaultCraftOptionsTokenAbi = require("../../../abi/vaultCraft/VaultCraftOptionsTokenAbi.json");

const exercise = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    amount: txnArgs.amount.toString(),
    // maxPaymentAmount: txnArgs.maxPaymentAmount.toString(),
    // recipient: txnArgs.recipient,
  };

  const optionsToken = new ethers.Contract(txn.to, vaultCraftOptionsTokenAbi, ethersHelper.getProvider(txn.chainId));
  data.amountUsd = ethers.utils.formatUnits(txnArgs.amount, await optionsToken.decimals());

  data.tag = enums.TaskTag.exercise;

  return data;
};

module.exports = {
  exercise,
};
