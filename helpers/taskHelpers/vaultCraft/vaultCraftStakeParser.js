const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const deposit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    // _pid: txnArgs._pid.toString(),
    // _amount: txnArgs._amount.toString(),
    // _stake: txnArgs._stake.toString(),
  };

  data.realFrom = txn.from;

  data.tag = enums.TaskTag.stake;

  return data;
};

module.exports = {
  deposit,
};
