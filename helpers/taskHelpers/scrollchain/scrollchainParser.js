const { enums } = require("../../../constants");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");

const swap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // paths: txnArgs[0].map((v) => ({
    //   steps: v[0].map((s) => ({ pool: s[0], data: s[1], callback: s[2], callbackData: s[3] })),
    //   tokenIn: v[1],
    //   amountIn: v[2].toString(),
    // })),
    // amountOutMin: txnArgs[1].toString(),
    // deadline: txnArgs[2].toString(),
  };

  data.tag = enums.TaskTag.swap;

  return data;
};

const swapWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // paths: txnArgs[0].map((v) => ({
    //   steps: v[0].map((s) => ({ pool: s[0], data: s[1], callback: s[2], callbackData: s[3] })),
    //   tokenIn: v[1],
    //   amountIn: v[2].toString(),
    // })),
    // amountOutMin: txnArgs[1].toString(),
    // deadline: txnArgs[2].toString(),
    // permit: {
    //   token: txnArgs[3][0],
    //   approveAmount: txnArgs[3][1].toString(),
    //   deadline: txnArgs[3][2].toString(),
    //   v: txnArgs[3][3],
    //   r: txnArgs[3][4],
    //   s: txnArgs[3][5],
    // },
  };

  data.tag = enums.TaskTag.swap;

  return data;
};

const addLiquidity = async ({ txn }) => {
  return await addLiquidity2({ txn })
};
const addLiquidity2 = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const parsed = {
    pool: txnArgs[0],
    inputs: txnArgs[1].map(d => ({
      token: d[0],
      amount: d[1].toString(),
      useVault: d[2],
    })),
    data: txnArgs[2],
    minLiquidity: txnArgs[3].toString(),
    callback: txnArgs[4],
    callbackData: txnArgs[5],
    staking: txnArgs[6],
  };

  let totalAmountUsd = 0
  await Promise.allSettled(
    parsed.inputs.map(i =>
      tokenPriceHelper
        .getTradeUsdTry(txn, i.token, i.amount, 0)
        .then(({ tokenUsd, tokenValue }) => {
          totalAmountUsd += parseFloat(tokenValue || "0")
          i.tokenUsd = tokenUsd
          i.amountUsd = tokenValue
        })
        .catch(e => { })
    )
  )

  const data = {
    amountUsd: totalAmountUsd,
    tag: enums.TaskTag.lp
  }
  return data;
}

const addLiquidityWithPermit = async ({ txn }) => {
  return await addLiquidityWithPermit2({ txn })
}

const addLiquidityWithPermit2 = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const parsed = {
    pool: txnArgs[0],
    inputs: txnArgs[1].map(d => ({
      token: d[0],
      amount: d[1].toString(),
      useVault: d[2],
    })),
    data: txnArgs[2],
    minLiquidity: txnArgs[3].toString(),
    callback: txnArgs[4],
    callbackData: txnArgs[5],
    permits: txnArgs[6].map(d => ({
      token: d[0],
      approveAmount: d[1].toString(),
      deadline: d[2].toString(),
      v: d[3],
      r: d[4],
      s: d[5],
    })),
    staking: txnArgs[7],
  };

  let totalAmountUsd = 0
  await Promise.allSettled(
    parsed.inputs.map(i =>
      tokenPriceHelper
        .getTradeUsdTry(txn, i.token, i.amount, 0)
        .then(({ tokenUsd, tokenValue }) => {
          totalAmountUsd += parseFloat(tokenValue || "0")
          i.tokenUsd = tokenUsd
          i.amountUsd = tokenValue
        })
        .catch(e => { })
    )
  )

  const data = {
    amountUsd: totalAmountUsd,
    tag: enums.TaskTag.lp
  }
  return data;
}



module.exports = {
  swap,
  swapWithPermit,
  addLiquidity,
  addLiquidity2,
  addLiquidityWithPermit,
  addLiquidityWithPermit2,
};
