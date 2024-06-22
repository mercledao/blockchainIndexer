const { ethers } = require("ethers");
const { enums, misc } = require("../../../constants");

const swap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // kind: txnArgs[0].toNumber(),
    // poolId: txnArgs[1],
    // assetIn: txnArgs[2],
    // amountIn: txnArgs[3].toString(),
    // assetOut: txnArgs[4],
    // amountOut: txnArgs[5].toString(),
    // deadline: txnArgs[6].toString(),
  };

  data.tag = enums.TaskTag.swap;
  data.amountUsd = 0;

  return data;
};

const batchSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // kind: txnArgs[0],
    // swaps: txnArgs[1].map((v) => ({
    //   poolId: v[0],
    //   assetIn: v[1],
    //   amountIn: v[2].toString(),
    //   assetOut: v[3],
    //   amountOut: v[4].toString(),
    //   userData: v[5],
    // })),
    // deadline: txnArgs[2].toString(),
  };

  data.tag = enums.TaskTag.swap;
  data.amountUsd = 0;

  return data;
};

const addLiquidity = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // pool: txnArgs[0],
    // receiver: txnArgs[1],
    // assetsIn: txnArgs[2],
    // amountsIn: txnArgs[3].map((v) => v.toString()),
  };

  data.tag = enums.TaskTag.stake;
  data.amountUsd = 0;

  return data;
};

module.exports = {
  swap,
  batchSwap,
  addLiquidity,
};
