const { ethers } = require("ethers");
const { MetadataApi } = require("@cowprotocol/app-data");
const dataPublisher = require("../indexer/dataPublisherHelper");
const cacheHelper = require("../cacheHelper");
const utils = require("../utils");
const { dateMillis, enumsComplex, misc, enums } = require("../../constants");
const tokenPriceHelper = require("../tokenPrice/tokenPriceHelper");
const ethersHelper = require("../ethersHelper");
const { decodeSignatureOwner, decodeTradeFlags, domain, decodeOrder } = require("@cowprotocol/contracts");
const { db } = require("../mongoHelper");

const metadataApi = new MetadataApi();

const processCowSwapGpV2Settlement = async ({ task, txn, tagsFound }) => {
  switch (txn.parsedTxn.name) {
    case "settle": {
      const tokens = txn.parsedTxn.args[0];
      // const clearingPrices = txn.parsedTxn.args[1].map((v) => v.toString());

      const trades = txn.parsedTxn.args[2].map((tradeData) => ({
        sellTokenIndex: tradeData[0].toString(),
        buyTokenIndex: tradeData[1].toString(),
        receiver: tradeData[2],
        sellAmount: tradeData[3].toString(),
        buyAmount: tradeData[4].toString(),
        validTo: tradeData[5].toString(),
        appData: tradeData[6], // <-- ipfs address contains affiliate data eg shapeshift
        feeAmount: tradeData[7].toString(),
        flags: tradeData[8].toString(),
        executedAmount: tradeData[9].toString(),
        signature: tradeData[10],
      }));

      // const interactions = txn.parsedTxn.args[3].map((_interactions) =>
      //   _interactions.map((interactionData) => ({
      //     target: interactionData[0],
      //     value: interactionData[1].toString(),
      //     calldata: interactionData[2],
      //   }))
      // );

      // trades are submited offchain so need to find real creator from signature
      trades.forEach((trade) => {
        trade.orderCreator = getOrderCreator(txn.to, txn.chainId, tokens, trade);
      });

      // update appCode
      const appCodes = await Promise.allSettled(trades.map((trade) => _getAppData(trade.appData)));
      trades.forEach((trade, i) => {
        if (appCodes[i].status != "fulfilled") return;
        trade.appCode = appCodes[i].value;
      });

      const foundTrade = trades.find((trade) => task.integrators?.has(trade.appCode?.appCode?.toLowerCase()));
      if (!task.integrators?.size || foundTrade) {
        const tradeUsdData = (await Promise.allSettled(trades.map((trade) => _getTradeUsd(txn, tokens, trade)))).map(
          ({ value }) => value
        );

        let amountUsd = 0;
        for (let i = 0; i < trades.length; i++) {
          const trade = trades[i];
          trade.tokenUsd = tradeUsdData[i]?.tokenUsd;
          trade.tokenValue = tradeUsdData[i]?.tokenValue;
          if (trade.tokenValue) {
            amountUsd += parseFloat(trade.tokenValue);
          }
        }

        const data = {
          // tokens,
          // clearingPrices,
          // trades,
          // interactions,
          // amountUsd,
        };
        dataPublisher.pushData({
          task,
          txn,
          data,
          taskType: enumsComplex.EventTypes.Cowswap.name,
          amountUsd,
          realFrom: trades[0].orderCreator,
          integrator: foundTrade?.appCode?.appCode?.toLowerCase(),
          tag: enums.TaskTag.swap,
        });
      }
      break;
    }
    case "swap": {
      // const swaps = txn.parsedTxn.args[0].map((swapData) => ({
      //   poolId: swapData[0].toString(),
      //   assetInIndex: swapData[1].toString(),
      //   assetOutIndex: swapData[2].toString(),
      //   amount: swapData[3].toString(),
      //   userData: swapData[4],
      // }));
      const tokens = txn.parsedTxn.args[1];
      const trade = {
        sellTokenIndex: txn.parsedTxn.args[2][0].toString(),
        buyTokenIndex: txn.parsedTxn.args[2][1].toString(),
        receiver: txn.parsedTxn.args[2][2],
        sellAmount: txn.parsedTxn.args[2][3].toString(),
        buyAmount: txn.parsedTxn.args[2][4].toString(),
        validTo: txn.parsedTxn.args[2][5].toString(),
        appData: txn.parsedTxn.args[2][6],
        feeAmount: txn.parsedTxn.args[2][7].toString(),
        flags: txn.parsedTxn.args[2][8].toString(),
        executedAmount: txn.parsedTxn.args[2][9].toString(),
        signature: txn.parsedTxn.args[2][10],
      };
      // trades are submited offchain so need to find real creator from signature
      trade.orderCreator = getOrderCreator(txn.to, txn.chainId, tokens, trade);

      // update appCode
      trade.appCode = await _getAppData(trade.appData);
      const tradeUsdData = await _getTradeUsd(txn, tokens, trade);
      trade.tokenUsd = tradeUsdData.tokenUsd;
      trade.tokenValue = tradeUsdData.tokenValue;

      const integrator = trade.appCode?.appCode?.toLowerCase();
      if (!task.integrators?.size || task.integrators.has(integrator)) {
        const data = {
          // swaps,
          // tokens,
          // trade,
        };
        dataPublisher.pushData({
          task,
          txn,
          data,
          taskType: enumsComplex.EventTypes.Cowswap.name,
          amountUsd: trade.tokenValue,
          realFrom: trade.orderCreator,
          integrator,
          tag: enums.TaskTag.swap,
        });
      }
      break;
    }
  }
};

const processCowSwapEthFlow = async ({ task, txn, tagsFound }) => {
  switch (txn.parsedTxn.name) {
    case "createOrder": {
      const order = {
        buyToken: txn.parsedTxn.args[0][0],
        receiver: txn.parsedTxn.args[0][1],
        sellAmount: txn.parsedTxn.args[0][2].toString(),
        buyAmount: txn.parsedTxn.args[0][3].toString(),
        appData: txn.parsedTxn.args[0][4],
        feeAmount: txn.parsedTxn.args[0][5].toString(),
        validTo: txn.parsedTxn.args[0][6].toString(),
        partiallyFillable: txn.parsedTxn.args[0][7],
        quoteId: txn.parsedTxn.args[0][8].toString(),
      };
      // update appCode
      order.appCode = await _getAppData(order.appData);

      const tradeUsdData = await _getTradeUsd(txn, [order.buyToken], {
        buyTokenIndex: 0,
        flags: 1,
        executedAmount: order.buyAmount,
      });
      order.tokenUsd = tradeUsdData.tokenUsd;
      order.tokenValue = tradeUsdData.tokenValue;

      const integrator = order.appCode?.appCode?.toLowerCase();
      // const data = order;
      const data = {};

      if (!task.integrators?.size || task.integrators.has(integrator)) {
        dataPublisher.pushData({
          task,
          txn,
          data,
          taskType: enumsComplex.EventTypes.Cowswap.name,
          amountUsd: order.tokenValue,
          integrator,
          tag: enums.TaskTag.swap,
        });
      }

      break;
    }
  }
};

const _getAppData = async (hex) => {
  try {
    const cacheHash = utils.hashObject({ hex, func: "_getAppData" });
    const cached = await cacheHelper.getDataJson(cacheHash);
    if (cached) return cached;

    const data = await metadataApi.decodeAppData(hex);

    cacheHelper.setDataJson(cacheHash, data, dateMillis.week_1);

    return data;
  } catch (e) {
    // no-op
  }
  return undefined;
};

const _getTradeUsd = async (txn, tokens, tradeData) => {
  try {
    const isSell = parseInt(tradeData.flags.toString()) % 2 == 0;

    const tokenAddress = isSell ? tokens[tradeData.sellTokenIndex] : tokens[tradeData.buyTokenIndex];

    const tokenUsd = await tokenPriceHelper.getUsdPriceOf({
      chainId: txn.chainId,
      tokenAddress: tokenAddress,
    });
    const decimals = await ethersHelper.getDecimals(tokenAddress, txn.chainId);
    const executedAmountFormatted = ethers.utils.formatUnits(tradeData.executedAmount, decimals);
    return { tokenUsd, tokenValue: tokenUsd * executedAmountFormatted };
  } catch (e) {
    console.error(`_getTradeUsd::${txn.chainId}::${txn.hash}::${{ tokens, tradeData }}`, e);
    throw e;
  }
};

const getOrderCreator = (contractAddress, chainId, tokens, trade) => {
  try {
    const order = decodeOrder(trade, tokens);
    const { signingScheme } = decodeTradeFlags(trade.flags);
    const creator = decodeSignatureOwner(domain(chainId, contractAddress), order, signingScheme, trade.signature);

    return creator.toLowerCase() == misc.cowswap.EthFlow[chainId].toLowerCase() ? trade.receiver : creator;
  } catch (e) {
    console.error("error::getOrderCreator::", e);
  }
  return undefined;
};

module.exports = {
  processCowSwapGpV2Settlement,
  processCowSwapEthFlow,
};
