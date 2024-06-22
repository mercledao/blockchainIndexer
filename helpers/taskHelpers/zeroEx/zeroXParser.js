const { ethers } = require("ethers");
const uniswapUtils = require("./uniswapUtils");
const zeroXUtils = require("./zeroXUtils");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");

const { misc } = require("../../../constants");

const fillTakerSignedOtcOrder = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      makerToken: txnArgs[0][0],
      takerToken: txnArgs[0][1],
      makerAmount: txnArgs[0][2].toString(),
      takerAmount: txnArgs[0][3].toString(),
      // maker: txnArgs[0][4],
      // taker: txnArgs[0][5],
      // txOrigin: txnArgs[0][6],
      // expiryAndNonce: txnArgs[0][7].toString(),
    },
    // makerSignature: txnArgs[1],
    // takerSignature: txnArgs[2],
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerToken, data.order.takerAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerToken, data.order.makerAmount);
  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillTakerSignedOtcOrderForEth = async ({ txn }) => {
  return await fillTakerSignedOtcOrder({ txn });
};

const fillOtcOrder = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      makerToken: txnArgs[0][0],
      takerToken: txnArgs[0][1],
      makerAmount: txnArgs[0][2].toString(),
      takerAmount: txnArgs[0][3].toString(),
      // maker: txnArgs[0][4],
      // taker: txnArgs[0][5],
      // txOrigin: txnArgs[0][6],
      // expiryAndNonce: txnArgs[0][7].toString(),
    },
    // makerSignature: {
    //   signatureType: txnArgs[1][0],
    //   v: txnArgs[1][1],
    //   r: txnArgs[1][2],
    //   s: txnArgs[1][3],
    // },
    takerTokenFillAmount: txnArgs[2].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerToken, data.takerTokenFillAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerToken, data.order.makerAmount);
  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillOtcOrderForEth = async ({ txn }) => {
  return await fillOtcOrder({ txn });
};

const fillOtcOrderWithEth = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      makerToken: txnArgs[0][0],
      takerToken: txnArgs[0][1],
      makerAmount: txnArgs[0][2].toString(),
      // takerAmount: txnArgs[0][3].toString(),
      // maker: txnArgs[0][4],
      // taker: txnArgs[0][5],
      // txOrigin: txnArgs[0][6],
      // expiryAndNonce: txnArgs[0][7].toString(),
    },
    // makerSignature: {
    //   signatureType: txnArgs[1][0],
    //   v: txnArgs[1][1],
    //   r: txnArgs[1][2],
    //   s: txnArgs[1][3],
    // },
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerToken, txn.value.toString());
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerToken, data.order.makerAmount);
  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillLimitOrder = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      makerToken: txnArgs[0][0],
      takerToken: txnArgs[0][1],
      makerAmount: txnArgs[0][2].toString(),
      // takerAmount: txnArgs[0][3].toString(),
      // takerTokenFeeAmount: txnArgs[0][4].toString(),
      // maker: txnArgs[0][5],
      // taker: txnArgs[0][6],
      // sender: txnArgs[0][7],
      // feeRecipient: txnArgs[0][8],
      // pool: txnArgs[0][9],
      // expiry: txnArgs[0][10].toString(),
      // salt: txnArgs[0][11].toString(),
    },
    // signature: {
    //   signatureType: txnArgs[1][0],
    //   v: txnArgs[1][1],
    //   r: txnArgs[1][2],
    //   s: txnArgs[1][3],
    // },
    takerTokenFillAmount: txnArgs[2].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerToken, data.takerTokenFillAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerToken, data.order.makerAmount);
  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillOrKillLimitOrder = async ({ txn }) => {
  // todo: need to check amount executed
  return await fillLimitOrder({ txn });
};

const fillRfqOrder = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    order: {
      makerToken: txnArgs[0][0],
      takerToken: txnArgs[0][1],
      makerAmount: txnArgs[0][2],
      // takerAmount: txnArgs[0][3],
      // maker: txnArgs[0][4],
      // taker: txnArgs[0][5],
      // txOrigin: txnArgs[0][6],
      // pool: txnArgs[0][7],
      // expiry: txnArgs[0][8],
      // salt: txnArgs[0][9],
    },
    // signature: {
    //   signatureType: txnArgs[1][0],
    //   v: txnArgs[1][1],
    //   r: txnArgs[1][2],
    //   s: txnArgs[1][3],
    // },
    takerTokenFillAmount: txnArgs[2].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdTaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.takerToken, data.takerTokenFillAmount);
  const tokenUsdMaker = await tokenPriceHelper.getTradeUsdTry(txn, data.order.makerToken, data.order.makerAmount);
  // data.tokenUsd = Math.min(tokenUsdTaker.tokenUsd, tokenUsdMaker.tokenUsd);
  data.amountUsd = Math.min(tokenUsdTaker.tokenValue, tokenUsdMaker.tokenValue);

  return data;
};

const fillOrKillRfqOrder = async ({ txn }) => {
  return await fillRfqOrder({ txn });
};

const batchFillLimitOrders = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    orders: txnArgs[0].map((order) => ({
      makerToken: order[0],
      takerToken: order[1],
      makerAmount: order[2].toString(),
      // takerAmount: order[3].toString(),
      // takerTokenFeeAmount: order[4].toString(),
      // maker: order[5],
      // taker: order[6],
      // sender: order[7],
      // feeRecipient: order[8],
      // pool: order[9],
      // expiry: order[10].toString(),
      // salt: order[11].toString(),
    })),
    // signatures: txnArgs[1].map((sign) => ({
    //   signatureType: sign[0],
    //   v: sign[1],
    //   r: sign[2],
    //   s: sign[3],
    // })),
    takerTokenFillAmounts: txnArgs[2].map((v) => v.toString()),
    // revertIfIncomplete: txnArgs[3],
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdsTaker = (
    await Promise.allSettled(
      data.orders.map((order, i) =>
        tokenPriceHelper.getTradeUsdTry(txn, order.takerToken, data.takerTokenFillAmounts[i])
      )
    )
  ).map((d) => d.value);
  const tokenUsdsMaker = (
    await Promise.allSettled(
      data.orders.map((order) => tokenPriceHelper.getTradeUsdTry(txn, order.makerToken, order.makerAmount))
    )
  ).map((d) => d.value);

  let amountUsd = 0;
  for (let i = 0; i < tokenUsdsTaker.length; i++) {
    const tokenUsdTaker = tokenUsdsTaker[i];
    const tokenUsdMaker = tokenUsdsMaker[i];

    // data.orders[i].tokenUsdTaker = tokenUsdTaker.tokenUsd;
    // data.orders[i].tokenValueTaker = tokenUsdTaker.tokenValue;

    // data.orders[i].tokenUsdMaker = tokenUsdMaker.tokenUsd;
    // data.orders[i].tokenValueMaker = tokenUsdMaker.tokenValue;

    // data.orders[i].tokenUsd = Math.min(tokenUsdTaker.tokenUsd || 0, tokenUsdMaker.tokenUsd || 0);
    data.orders[i].tokenValue = Math.min(tokenUsdTaker.tokenValue || 0, tokenUsdMaker.tokenValue || 0);

    if (data.orders[i].tokenValue) {
      amountUsd += parseFloat(data.orders[i].tokenValue || 0);
    }
  }

  data.amountUsd = amountUsd;

  return data;
};

const batchFillRfqOrders = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    orders: txnArgs[0].map((order) => ({
      makerToken: order[0],
      takerToken: order[1],
      makerAmount: order[2].toString(),
      // takerAmount: order[3].toString(),
      // maker: order[4],
      // taker: order[5],
      // txOrigin: order[6],
      // pool: order[7],
      // expiry: order[8].toString(),
      // salt: order[9].toString(),
    })),
    // signatures: txnArgs[1].map((sign) => ({
    //   signatureType: sign[0],
    //   v: sign[1],
    //   r: sign[2],
    //   s: sign[3],
    // })),
    takerTokenFillAmounts: txnArgs[2].map((v) => v.toString()),
    // revertIfIncomplete: txnArgs[3],
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsdsTaker = (
    await Promise.allSettled(
      data.orders.map((order, i) =>
        tokenPriceHelper.getTradeUsdTry(txn, order.takerToken, data.takerTokenFillAmounts[i])
      )
    )
  ).map((d) => d.value);
  const tokenUsdsMaker = (
    await Promise.allSettled(
      data.orders.map((order) => tokenPriceHelper.getTradeUsdTry(txn, order.makerToken, order.makerAmount))
    )
  ).map((d) => d.value);

  let amountUsd = 0;
  for (let i = 0; i < tokenUsdsTaker.length; i++) {
    const tokenUsdTaker = tokenUsdsTaker[i];
    const tokenUsdMaker = tokenUsdsMaker[i];

    // data.orders[i].tokenUsdTaker = tokenUsdTaker.tokenUsd;
    // data.orders[i].tokenValueTaker = tokenUsdTaker.tokenValue;

    // data.orders[i].tokenUsdMaker = tokenUsdMaker.tokenUsd;
    // data.orders[i].tokenValueMaker = tokenUsdMaker.tokenValue;

    // data.orders[i].tokenUsd = Math.min(tokenUsdTaker.tokenUsd || 0, tokenUsdMaker.tokenUsd || 0);
    data.orders[i].tokenValue = Math.min(tokenUsdTaker.tokenValue || 0, tokenUsdMaker.tokenValue || 0);

    if (data.orders[i].tokenValue) {
      amountUsd += parseFloat(data.orders[i].tokenValue || 0);
    }
  }

  data.amountUsd = amountUsd;

  return data;
};

const multiplexBatchSellEthForToken = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // outputToken: txnArgs[0],
    // todo: hop data. parse if required
    // https://github.com/0xProject/protocol/blob/3c98225720ce9e1c87b59547f9be90e76ec834bb/contracts/zero-ex/contracts/src/features/multiplex/MultiplexFeature.sol#L394
    // calls: txnArgs[1].map((call) => ({ id: call[0], sellAmount: call[1].toString(), data: call[2] })),
    // minBuyAmount: txnArgs[2].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.ETH, txn.value.toString());
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const multiplexBatchSellTokenForEth = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    inputToken: txnArgs[0],
    // todo: hop data. parse if required
    // https://github.com/0xProject/protocol/blob/3c98225720ce9e1c87b59547f9be90e76ec834bb/contracts/zero-ex/contracts/src/features/multiplex/MultiplexFeature.sol#L394
    // calls: txnArgs[1].map((call) => ({ id: call[0], sellAmount: call[1].toString(), data: call[2] })),
    sellAmount: txnArgs[2].toString(),
    // minBuyAmount: txnArgs[3].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.inputToken, data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const multiplexBatchSellTokenForToken = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    inputToken: txnArgs[0],
    // outputToken: txnArgs[1],
    // todo: hop data. parse if required
    // https://github.com/0xProject/protocol/blob/3c98225720ce9e1c87b59547f9be90e76ec834bb/contracts/zero-ex/contracts/src/features/multiplex/MultiplexFeature.sol#L394
    // calls: txnArgs[2].map((call) => ({ id: call[0], sellAmount: call[1].toString(), data: call[2] })),
    sellAmount: txnArgs[3].toString(),
    // minBuyAmount: txnArgs[4].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.inputToken, data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;
  return data;
};

const multiplexMultiHopSellEthForToken = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    tokens: txnArgs[0],
    // todo: may have to prase hops later
    // calls: txnArgs[1].map((call) => ({ id: call[0], data: call[1] })),
    // minBuyAmount: txnArgs[2].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  // 0th token is always token to sell
  // https://github.com/0xProject/protocol/blob/62a530d7ece642f1dcc02d53e24bdb84df92b0d1/contracts/zero-ex/contracts/src/features/multiplex/MultiplexFeature.sol#L235
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokens[0], txn.value.toString());
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const multiplexMultiHopSellTokenForEth = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    tokens: txnArgs[0],
    // todo: may have to prase hops later
    // calls: txnArgs[1].map((call) => ({ id: call[0], data: call[1] })),
    sellAmount: txnArgs[2].toString(),
    // minBuyAmount: txnArgs[3].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  // 0th token is always token to sell
  // https://github.com/0xProject/protocol/blob/62a530d7ece642f1dcc02d53e24bdb84df92b0d1/packages/contract-artifacts/artifacts/IZeroEx.json#L4390
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokens[0], data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const multiplexMultiHopSellTokenForToken = async ({ txn }) => {
  return await multiplexMultiHopSellTokenForEth({ txn });
};

const sellToLiquidityProvider = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    inputToken: txnArgs[0],
    // outputToken: txnArgs[1],
    // provider: txnArgs[2],
    // recipient: txnArgs[3],
    sellAmount: txnArgs[4].toString(),
    // minBuyAmount: txnArgs[5].toString(),
    // auxiliaryData: txnArgs[6],
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.inputToken, data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const sellToPancakeSwap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    tokens: txnArgs[0],
    sellAmount: txnArgs[1].toString(),
    // minBuyAmount: txnArgs[2].toString(),
    // fork: txnArgs[3].toString(),
    // ether: ethers.utils.formatEther(txn.value),
  };

  // 0th token is always token to sell
  // https://github.com/0xProject/protocol/blob/62a530d7ece642f1dcc02d53e24bdb84df92b0d1/packages/contract-artifacts/artifacts/IZeroEx.json#L4390
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokens[0], data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const sellToUniswap = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    tokens: txnArgs[0],
    sellAmount: txnArgs[1].toString(),
    // minBuyAmount: txnArgs[2].toString(),
    // isSushi: txnArgs[3],
    // ether: ethers.utils.formatEther(txn.value),
  };

  // 0th token is always token to sell
  // https://github.com/0xProject/protocol/blob/62a530d7ece642f1dcc02d53e24bdb84df92b0d1/packages/contract-artifacts/artifacts/IZeroEx.json#L4390
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokens[0], data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const sellTokenForEthToUniswapV3 = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const encodedPath = txnArgs[0];
  const data = {
    // encodedPath,
    sellAmount: txnArgs[1].toString(),
    // minBuyAmount: txnArgs[2].toString(),
    // recipient: txnArgs[3],
    hops: uniswapUtils.decodeAllPoolInfoFromPath(encodedPath),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.hops[0].inputToken, data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const sellEthForTokenToUniswapV3 = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const encodedPath = txnArgs[0];
  const data = {
    // encodedPath,
    // minBuyAmount: txnArgs[1].toString(),
    // recipient: txnArgs[2],
    // hops: uniswapUtils.decodeAllPoolInfoFromPath(encodedPath),
    // ether: ethers.utils.formatEther(txn.value),
  };
  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.WETH[txn.chainId], txn.value.toString());
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const sellTokenForTokenToUniswapV3 = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const encodedPath = txnArgs[0];
  const data = {
    // encodedPath,
    sellAmount: txnArgs[1].toString(),
    // minBuyAmount: txnArgs[2].toString(),
    // recipient: txnArgs[3],
    hops: uniswapUtils.decodeAllPoolInfoFromPath(encodedPath),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.hops[0].inputToken, data.sellAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

const transformERC20 = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    inputToken: txnArgs[0],
    // outputToken: txnArgs[1],
    inputTokenAmount: txnArgs[2].toString(),
    // minOutputTokenAmount: txnArgs[3].toString(),
    transformations: txnArgs[4].map((transformation) => ({
      deploymentNonce: transformation[0],
      data: transformation[1],
      decoded: zeroXUtils.decodeTransformation(transformation[1]),
    })),
    // ether: ethers.utils.formatEther(txn.value),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.inputToken, data.inputTokenAmount);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;

  data.amountUsd = tokenUsd.tokenValue;

  return data;
};

module.exports = {
  fillTakerSignedOtcOrder,
  fillTakerSignedOtcOrderForEth,
  fillOtcOrder,
  fillOtcOrderForEth,
  fillOtcOrderWithEth,
  fillLimitOrder,
  fillOrKillLimitOrder,
  fillRfqOrder,
  fillOrKillRfqOrder,
  batchFillLimitOrders,
  batchFillRfqOrders,
  multiplexBatchSellEthForToken,
  multiplexBatchSellTokenForEth,
  multiplexBatchSellTokenForToken,
  multiplexMultiHopSellEthForToken,
  multiplexMultiHopSellTokenForEth,
  multiplexMultiHopSellTokenForToken,
  sellToLiquidityProvider,
  sellToPancakeSwap,
  sellToUniswap,
  sellTokenForEthToUniswapV3,
  sellEthForTokenToUniswapV3,
  sellTokenForTokenToUniswapV3,
  transformERC20,
};
