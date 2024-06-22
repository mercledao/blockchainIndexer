const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");

const clipperSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    srcToken: txnArgs[0],
    // dstToken: txnArgs[1],
    amount: txnArgs[2].toString(),
    // minReturn: txnArgs[3].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const clipperSwapTo = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // recipient: txnArgs[0],
    srcToken: txnArgs[1],
    // dstToken: txnArgs[2],
    amount: txnArgs[3].toString(),
    // minReturn: txnArgs[4].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const fillOrderRFQ = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      // info: txnArgs[0][0],
      makerAsset: txnArgs[0][1],
      takerAsset: txnArgs[0][2],
      // maker: txnArgs[0][3],
      // allowedSender: txnArgs[0][4],
      // makingAmount: txnArgs[0][5].toString(),
      // takingAmount: txnArgs[0][6].toString(),
    },
    // signature: txnArgs[1],
    makingAmount: txnArgs[2].toString(),
    takingAmount: txnArgs[3].toString(),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerAsset, data.takingAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerAsset, data.makingAmount);

  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillOrderRFQTo = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      // info: txnArgs[0][0],
      makerAsset: txnArgs[0][1],
      takerAsset: txnArgs[0][2],
      // maker: txnArgs[0][3],
      // allowedSender: txnArgs[0][4],
      // makingAmount: txnArgs[0][5].toString(),
      // takingAmount: txnArgs[0][6].toString(),
    },
    // signature: txnArgs[1],
    makingAmount: txnArgs[2].toString(),
    takingAmount: txnArgs[3].toString(),
    // target: txnArgs[4],
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerAsset, data.takingAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerAsset, data.makingAmount);

  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillOrderRFQToWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      // info: txnArgs[0][0],
      makerAsset: txnArgs[0][1],
      takerAsset: txnArgs[0][2],
      // maker: txnArgs[0][3],
      // allowedSender: txnArgs[0][4],
      // makingAmount: txnArgs[0][5].toString(),
      // takingAmount: txnArgs[0][6].toString(),
    },
    // signature: txnArgs[1],
    makingAmount: txnArgs[2].toString(),
    takingAmount: txnArgs[3].toString(),
    // target: txnArgs[4],
    // permit: txnArgs[5],
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerAsset, data.takingAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerAsset, data.makingAmount);

  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const swap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    caller: txnArgs[0],
    desc: {
      srcToken: txnArgs[1][0],
      // dstToken: txnArgs[1][1],
      // srcReceiver: txnArgs[1][2],
      // dstReceiver: txnArgs[1][3],
      amount: txnArgs[1][4].toString(),
      // minReturnAmount: txnArgs[1][5].toString(),
      // flags: txnArgs[1][6].toString(),
      // permit: txnArgs[1][7],
    },
    // data: txnArgs[2],
    ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.desc.srcToken, data.desc.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const uniswapV3Swap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    amount: txnArgs[0].toString(),
    // minReturn: txnArgs[1].toString(),
    pools: txnArgs[2].map((v) => v.toString()),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, ethers.utils.getAddress(data.pools[0]), data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const uniswapV3SwapTo = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // recipient: txnArgs[0],
    amount: txnArgs[1].toString(),
    // minReturn: txnArgs[2].toString(),
    pools: txnArgs[3].map((v) => v.toString()),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, ethers.utils.getAddress(data.pools[0]), data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const uniswapV3SwapToWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // recipient: txnArgs[0],
    srcToken: txnArgs[1],
    amount: txnArgs[2].toString(),
    // minReturn: txnArgs[3].toString(),
    // pools: txnArgs[4].map((v) => v.toString()),
    // permit: txnArgs[5],
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const unoswap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    srcToken: txnArgs[0],
    amount: txnArgs[1].toString(),
    // minReturn: txnArgs[2].toString(),
    // pools: txnArgs[3],
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const unoswapWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    srcToken: txnArgs[0],
    amount: txnArgs[1].toString(),
    // minReturn: txnArgs[2].toString(),
    // pools: txnArgs[3],
    // permit: txnArgs[4],
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

module.exports = {
  clipperSwap,
  clipperSwapTo,
  fillOrderRFQ,
  fillOrderRFQTo,
  fillOrderRFQToWithPermit,
  swap,
  uniswapV3Swap,
  uniswapV3SwapTo,
  uniswapV3SwapToWithPermit,
  unoswap,
  unoswapWithPermit,
};
