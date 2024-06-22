const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const uniswapUtils = require("../zeroEx/uniswapUtils");

const clipperSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // clipperExchange: txnArgs[0],
    srcToken: txnArgs[1],
    // dstToken: txnArgs[2],
    inputAmount: txnArgs[3].toString(),
    // outputAmount: txnArgs[4].toString(),
    // goodUntil: txnArgs[5].toString(),
    // r: txnArgs[6],
    // vs: txnArgs[7].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.inputAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const clipperSwapTo = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // clipperExchange: txnArgs[0],
    // recipient: txnArgs[1],
    srcToken: txnArgs[2],
    // dstToken: txnArgs[3],
    inputAmount: txnArgs[4].toString(),
    // outputAmount: txnArgs[5].toString(),
    // goodUntil: txnArgs[6].toString(),
    // r: txnArgs[7],
    // vs: txnArgs[8].toString(),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.inputAmount);
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
      makingAmount: txnArgs[0][5].toString(),
      takingAmount: txnArgs[0][6].toString(),
    },
    // signature: txnArgs[1],
    // flagsAndAmount: txnArgs[2].toString(),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerAsset, data.order.takingAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerAsset, data.order.makingAmount);

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
      makingAmount: txnArgs[0][5].toString(),
      takingAmount: txnArgs[0][6].toString(),
    },
    // signature: txnArgs[1],
    // flagsAndAmount: txnArgs[2].toString(),
    // target: txnArgs[3],
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerAsset, data.order.takingAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerAsset, data.order.makingAmount);

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
      makingAmount: txnArgs[0][5].toString(),
      takingAmount: txnArgs[0][6].toString(),
    },
    // signature: txnArgs[1],
    // flagsAndAmount: txnArgs[2].toString(),
    // target: txnArgs[4],
    // permit: txnArgs[5],
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerAsset, data.order.takingAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerAsset, data.order.makingAmount);

  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const swap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // caller: txnArgs[0],
    desc: {
      srcToken: txnArgs[1][0],
      // dstToken: txnArgs[1][1],
      // srcReceiver: txnArgs[1][2],
      // dstReceiver: txnArgs[1][3],
      amount: txnArgs[1][4].toString(),
      // minReturnAmount: txnArgs[1][5].toString(),
      // flags: txnArgs[1][6].toString(),
    },
    // permit: txnArgs[2],
    // data: txnArgs[3],
    // ether: ethers.utils.formatEther(txn.value),
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
    poolsRaw: txnArgs[2].map((v) => v.toString()),
    pools: txnArgs[2].map((v) => {
      /**
       * sample value
       * 1309965086496691229659050726675049578233177334449
       * hex: E574DDB560D3507BA34B0DB531B831B7918C62B1
       * its pool address
       *
       * 86844066927987146567678238756897452358540154498072832373903393263623352485905
       * hex: C0000000000000000000000042D403AB9B0603442AC991C0CFE124105DDE0811
       * last 40 chars is pool address. initial value is some flag.
       * Their code is closesourced so cannot see implementation
       */
      const hexValue = ethers.BigNumber.from(v).toHexString();
      if (ethers.utils.isAddress(hexValue)) return ethers.utils.getAddress(hexValue);
      return ethers.utils.getAddress(`0x${hexValue.substring(hexValue.length - 40)}`);
    }),
  };

  /**
   * if pool is token address then select token0,
   * else if (pool & 1<<253) > 0 then token 0 else token 1
   *
   * https://etherscan.io/address/0x1111111254eeb25477b68fb85ed929f73a960582#code#L2823
   */
  const tokenIndex =
    data.pools[0].length <= 42 || (ethers.BigNumber.from(data.poolsRaw[0]).shr(253).toNumber() & 1) > 0 ? 0 : 1;

  const pool0 = data.pools[0];
  const token = await uniswapUtils.getTokenFromV3Pool(pool0, txn.chainId, tokenIndex);

  // data.token = token;
  // data.tokenIndex = tokenIndex;

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, token, data.amount);
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
    poolsRaw: txnArgs[3].map((v) => v.toString()),
    pools: txnArgs[3].map((v) => {
      /**
       * sample value
       * 1309965086496691229659050726675049578233177334449
       * hex: E574DDB560D3507BA34B0DB531B831B7918C62B1
       * its pool address
       *
       * 86844066927987146567678238756897452358540154498072832373903393263623352485905
       * hex: C0000000000000000000000042D403AB9B0603442AC991C0CFE124105DDE0811
       * last 40 chars is pool address. initial value is some flag.
       * Their code is closesourced so cannot see implementation
       */
      const hexValue = ethers.BigNumber.from(v).toHexString();
      if (ethers.utils.isAddress(hexValue)) return ethers.utils.getAddress(hexValue);
      return ethers.utils.getAddress(`0x${hexValue.substring(hexValue.length - 40)}`);
    }),
  };

  /**
   * if pool is token address then select token0,
   * else if (pool & 1<<253) > 0 then token 0 else token 1
   *
   * https://etherscan.io/address/0x1111111254eeb25477b68fb85ed929f73a960582#code#L2823
   */
  const tokenIndex =
    data.pools[0].length <= 42 || (ethers.BigNumber.from(data.poolsRaw[0]).shr(253).toNumber() & 1) > 0 ? 0 : 1;

  const pool0 = data.pools[0];
  const token = await uniswapUtils.getTokenFromV3Pool(pool0, txn.chainId, tokenIndex);

  // data.token = token;
  // data.tokenIndex = tokenIndex;

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, token, data.amount);
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

const unoswapTo = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // recipient: txnArgs[0],
    srcToken: txnArgs[1],
    amount: txnArgs[2].toString(),
    // minReturn: txnArgs[3].toString(),
    // pools: txnArgs[4],
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const unoswapToWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // recipient: txnArgs[0],
    srcToken: txnArgs[1],
    amount: txnArgs[2].toString(),
    // minReturn: txnArgs[3].toString(),
    // pools: txnArgs[4],
    // permit: txnArgs[5],
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.srcToken, data.amount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

module.exports = {
  swap,
  clipperSwap,
  clipperSwapTo,
  fillOrderRFQ,
  fillOrderRFQTo,
  fillOrderRFQToWithPermit,
  uniswapV3Swap,
  uniswapV3SwapTo,
  uniswapV3SwapToWithPermit,
  unoswap,
  unoswapTo,
  unoswapToWithPermit,
};
