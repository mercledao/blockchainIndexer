const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const zapBond = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args[0];
  // const swapArgs = txn.parsedTxn.args[1];

  const data = {
    tokenIn: txnArgs[0],
    amountIn: txnArgs[1].toString(),
    // token0: txnArgs[2],
    // token1: txnArgs[3],
    // path0: txnArgs[4].map((tx) => tx.toString()),
    // path0: txnArgs[5].map((tx) => tx.toString()),
    // liquidityPath: txnArgs[6].map((tx) => tx.toString()),
    // to: txnArgs[7],
    // deadline: txnArgs[8].toString(),
    // swapRouter: swapArgs[0],
    // swapType: swapArgs[1],
    // swapPath: swapArgs[2].map((tx) => tx.toString()),
    // amountOut: swapArgs[3].toString(),
    // amountOutMin: swapArgs[4].toString(),
    // bond: txn.parsedTxn.args[3],
    // maxPrice: txn.parsedTxn.args[4].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokenIn, data.amountIn, 0);

  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.bond;

  return data;
};

const zap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    zapParams: {
      tokenIn: txnArgs[0][0],
      amountIn: txnArgs[0][1],
      token0: txnArgs[0][2],
      token1: txnArgs[0][3],
      path0: {
        swapRouter: txnArgs[0][4][0],
        swapType: txnArgs[0][4][1],
        path: txnArgs[0][4][2],
        amountOut: txnArgs[0][4][3],
        amountOutMin: txnArgs[0][4][4],
      },
      path1: {
        swapRouter: txnArgs[0][5][0],
        swapType: txnArgs[0][5][1],
        path: txnArgs[0][5][2],
        amountOut: txnArgs[0][5][3],
        amountOutMin: txnArgs[0][5][4],
      },
      liquidityPath: {
        lpRouter: txnArgs[0][6][0],
        lpType: txnArgs[0][6][1],
        amountAMin: txnArgs[0][6][2],
        amountBMin: txnArgs[0][6][3],
        lpAmount: txnArgs[0][6][4],
      },
      to: txnArgs[0][7],
      deadline: txnArgs[0][8],
    },
    feeSwapPath: {
      swapRouter: txnArgs[1][0],
      swapType: txnArgs[1][1],
      path: txnArgs[1][2],
      amountOut: txnArgs[1][3],
      amountOutMin: txnArgs[1][4],
    },
  };

  data.tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.zapParams.tokenIn, data.zapParams.amountIn, 0);
  data.amountUsd = data.tokenUsd.tokenValue;
  if (data.zapParams.to != ethers.constants.AddressZero) data.realFrom = data.to;

  const finalData = {
    amountUsd: data.amountUsd,
    tag: enums.TaskTag.deposit,
    realFrom: data.realFrom,
  };
  return finalData;
};

module.exports = {
  zapBond, // buy bond
  zap, // add lp to bond token pair
};
