const { ethers } = require("ethers");
const { enums, misc } = require("../../../constants");

const mint = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    to: txnArgs[0],
    amount: txnArgs[2].toNumber(),
  };
  data.realFrom = data.to;
  data.amountUsd = 0;
  data.tag = enums.TaskTag.mint;

  return data;
};

module.exports = {
  mint,
};
