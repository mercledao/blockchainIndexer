const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const ethersHelper = require("../../ethersHelper");
const { enums, misc, abi } = require("../../../constants");
const { getTokenFromQuickSwapPool } = require("./quickSwapUtils");

const deposit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    vaultAddress: txnArgs[0],
    amount0Desired: txnArgs[1].toString(),
    amount1Desired: txnArgs[2].toString(),
    // amount0Min: txnArgs[3].toString(),
    // amount1Min: txnArgs[4].toString(),
    // to: txnArgs[5],
  };

  const token0 = await getTokenFromQuickSwapPool(data.vaultAddress, txn.chainId, 0);
  const token1 = await getTokenFromQuickSwapPool(data.vaultAddress, txn.chainId, 1);

  const token0Usd = await tokenPriceHelper.getTradeUsdTry(txn, token0, data.amount0Desired, 0);
  const token1Usd = await tokenPriceHelper.getTradeUsdTry(txn, token1, data.amount1Desired, 0);

  // data.token0Usd = token0Usd.tokenUsd;
  // data.token1Usd = token1Usd.tokenUsd;
  // data.token0Value = token0Usd.tokenValue;
  // data.token1Value = token1Usd.tokenValue;
  data.amountUsd = token0Usd.tokenValue + token1Usd.tokenValue;
  if (txnArgs[5] != ethers.constants.AddressZero) data.realFrom = txnArgs[5];

  data.tag = enums.TaskTag.deposit;

  return data;
};

const collect = async ({ txnArgs }) => {
  const data = {
    tokenId: txnArgs[0][0].toString(),
    recipient: txnArgs[0][1],
    amount0Max: txnArgs[0][2].toString(),
    amount1Max: txnArgs[0][3].toString(),
  };
  return data;
};

const unwrapWNativeToken = async ({ txnArgs }) => {
  const data = {
    amountMinimum: txnArgs[0].toString(),
    recipient: txnArgs[1],
  };
  return data;
};

const sweepToken = async ({ txnArgs }) => {
  const data = {
    token: txnArgs[0],
    amountMinimum: txnArgs[1].toString(),
    recipient: txnArgs[2],
  };
  return data;
};

const decreaseLiquidity = async ({ txn, txnArgs }) => {
  const data = {
    tokenId: txnArgs[0][0].toString(),
    liquidity: txnArgs[0][1].toString(),
    amount0Min: txnArgs[0][2].toString(),
    amount1Min: txnArgs[0][3].toString(),
    deadline: txnArgs[0][4].toString(),
  };
  return data;
};

const refundNativeToken = async ({}) => {
  return {};
};

const mint = async ({ txn, txnArgs }) => {
  const data = {
    token0: txnArgs[0][0],
    token1: txnArgs[0][1],
    tickLower: txnArgs[0][2].toString(),
    tickUpper: txnArgs[0][3].toString(),
    amount0Desired: txnArgs[0][4].toString(),
    amount1Desired: txnArgs[0][5].toString(),
    amount0Min: txnArgs[0][6].toString(),
    amount1Min: txnArgs[0][7].toString(),
    recipient: txnArgs[0][8],
    deadline: txnArgs[0][9].toString(),
  };

  const token0Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.token0, data.amount0Desired, 0);
  const token1Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.token1, data.amount1Desired, 0);

  data.amountUsd = token0Usd.tokenValue + token1Usd.tokenValue;

  return data;
};

const createAndInitializePoolIfNecessary = async ({ txn, txnArgs }) => {
  const data = {
    token0: txnArgs[0],
    token1: txnArgs[1],
    sqrtPriceX96: txnArgs[2].toString(),
  };
  return data;
};

const increaseLiquidity = async ({ txn, txnArgs }) => {
  const data = {
    tokenId: txnArgs[0][0].toString(),
    amount0Desired: txnArgs[0][1].toString(),
    amount1Desired: txnArgs[0][2].toString(),
    amount0Min: txnArgs[0][3].toString(),
    amount1Min: txnArgs[0][4].toString(),
    deadline: txnArgs[0][5].toString(),
  };

  // todo: cache this
  const positionManager = new ethers.Contract(
    txn.to,
    abi.quickSwapAlgebraPositionsNftV1Abi,
    ethersHelper.getProvider(txn.chainId)
  );
  const position = await positionManager.positions(data.tokenId);
  data.token0 = position[2];
  data.token1 = position[3];

  const token0Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.token0, data.amount0Desired, 0);
  const token1Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.token1, data.amount1Desired, 0);

  data.amountUsd = token0Usd.tokenValue + token1Usd.tokenValue;

  return data;
};

const multicall = async ({ txn }) => {
  const bytesParser = {
    // add/join pool
    createAndInitializePoolIfNecessary,
    mint,
    increaseLiquidity,

    // remove/exit pool
    // decreaseLiquidity,
    // sweepToken,
    // unwrapWNativeToken,
    // collect,

    // refundNativeToken,
  };

  const txnArgs = txn.parsedTxn.args;

  // txn data bytes for multiple internal txns
  const bytes = txnArgs[0];
  const data = { decodedBytes: [] };

  for (let i = 0; i < bytes.length; i++) {
    const parsedInternalTxn = txn.interface.parseTransaction({ data: bytes[i] });
    const parser = bytesParser[parsedInternalTxn.name];

    if (parser) {
      const parsedData = await parser({ txn, txnArgs: parsedInternalTxn.args });
      data.decodedBytes.push({ name: parsedInternalTxn.name, data: parsedData });

      if (parsedData.amountUsd) data.amountUsd = parsedData.amountUsd;
    }
  }

  if (!data.decodedBytes.length) return undefined;

  const finalData = {
    amountUsd: data.amountUsd || 0,
    tag: enums.TaskTag.deposit,
  };

  return finalData;
};

module.exports = {
  deposit,
  multicall,
};
