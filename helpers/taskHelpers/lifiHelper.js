const { ethers } = require("ethers");
const ethersHelper = require("../ethersHelper");
const dataPublisher = require("../indexer/dataPublisherHelper");
const tokenPriceHelper = require("../tokenPrice/tokenPriceHelper");
const { enumsComplex, enums } = require("../../constants");

const processLifi = async ({ task, txn, tagsFound }) => {
  /**
   * ordering of the if condition matters.
   * 1st priority is bridge because input is formatted for bridge.
   * 2nd priority is swap because swap as standalone has different input structure
   */
  if (tagsFound.has("bridge")) {
    const integrator = txn.parsedTxn.args[0][2].toLowerCase();
    if (!task.integrators?.size || task.integrators?.has(integrator)) {
      // is bridge
      const tokenAddress = txn.parsedTxn.args[0][4];
      const decimals = await ethersHelper.getDecimals(tokenAddress, txn.chainId);
      const tokenUsd = await tokenPriceHelper.getUsdPriceOf({ chainId: txn.chainId, tokenAddress });
      const amount = ethers.utils.formatUnits(txn.parsedTxn.args[0][6], decimals);
      const amountUsd = tokenUsd * amount;
      // const bridge = {
      //   tokenAddr: tokenAddress,
      //   amount,
      //   decimals,
      //   destinationChainId: parseInt(txn.parsedTxn.args[0][7].toString()),
      //   bridge: txn.parsedTxn.args[0][1],
      //   integrator: txn.parsedTxn.args[0][2],
      //   receiver: txn.parsedTxn.args[0][5],
      //   tokenUsd,
      //   tokenValue: tokenUsd * amount,
      // };

      //todo: swap is different for different routes so difficult to map
      // const swap = txn.parsedTxn.args[1] || {};

      // const stargate = txn.parsedTxn.args[2]
      //   ? {
      //       dstPoolId: parseInt(txn.parsedTxn.args[2][0]?.toString()),
      //       minAmountLD: txn.parsedTxn.args[2][1]?.toString(),
      //       dstGasForCall: txn.parsedTxn.args[2][2]?.toString(),
      //       lzFee: txn.parsedTxn.args[2][3]?.toString(),
      //       refundAddress: txn.parsedTxn.args[2][4],
      //       callTo: txn.parsedTxn.args[2][5],
      //       callData: txn.parsedTxn.args[2][6],
      //     }
      //   : {};
      // todo: calculate total trade value in dollars including swaps

      const data = {
        // bridge,
        // swap,
        // stargate
      };
      dataPublisher.pushData({
        task,
        txn,
        data,
        taskType: enumsComplex.EventTypes.LifiBridge.name,
        amountUsd,
        integrator,
        tag: enums.TaskTag.bridge,
      });
    }
  }
  if (tagsFound.has("swap")) {
    console.log("lifi swap");
    // todo: handle for swap
  }
};

module.exports = { processLifi };
