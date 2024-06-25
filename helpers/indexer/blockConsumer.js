const { ethers } = require("ethers");
const { rpc, dateMillis, id } = require("../../constants");
const {
  getBlockReceipts,
  getBlockTransactions,
  getBlockTransactionsWithoutChecksum,
} = require("../ethersHelper");
const txnIndexer = require("./txnIndexer");
const eventIndexer = require("./eventIndexer");
const {
  task,
  trackTxns,
  trackEvents,
  popBlock,
  addBlocksQueue,
  addProcessedBlockQueue,
  getProcessedBlockQueue,
} = require("../cacheHelper");

const { db } = require("../mongoHelper");
const { saveTxnsToDb, saveLogsToDb } = require("../psqlHelper");

const blockConsumerJobs = {};
const isConsuming = {};

const delayed = {}; // delay blocknumber
const latestBlock = {};

const init = async () => {
  await populateTaskConfig();
  await consumeBlockJob();
  await saveConsumedBlockToDbJob();
};

const consumeBlockJob = async () => {
  const supportedChains = Object.keys(rpc);

  // consume blocks
  for (let i = 0; i < supportedChains.length; i++) {
    const chainId = supportedChains[i];
    blockConsumerJobs[chainId] = setInterval(() => {
      _consumeAllPendingBlocksForChain(chainId);
    }, parseInt(rpc[chainId].consumeRate));
  }
};

const saveTxnsWithReceipt = async (chainId, blockNumber, receipts) => {
  if(!receipts) return;

  const txns = await getBlockTransactionsWithoutChecksum(chainId, parseInt(blockNumber)); // Grouped
  const mp = {}; // Mapping txHash in Receipts to Receipt Index
  const saveTxns = [], saveLogs = [];

  // Start mapping
  receipts.forEach((receipt, index) => {
    mp[receipt.transactionHash] = index;
  });

  // Attaching receipt to txn
  txns.forEach((tx) => {
    tx.receipt = receipts[mp[tx.hash]];
  });

  // Save to db
  txns.forEach((txn) => {
    // Only save when receipt status === "0x1"
    if(txn.receipt.status === "0x1") {
      saveTxns.push({
        blockNumber: txn.blockNumber,
        fromAddr: txn.from,
        gas: txn.gas,
        gasPrice: txn.gasPrice,
        maxFeePerGas: txn.maxFeePerGas,
        maxPriorityFeePerGas: txn.maxPriorityFeePerGas,
        txnHash: txn.hash,
        input: txn.input,
        nonce: txn.nonce,
        toAddr: txn.to,
        value: txn.value,
        type: txn.type,
        chainId: chainId,
        receiptContractAddress: txn.receipt.contractAddress,
        receiptCumulativeGasUsed: txn.receipt.cumulativeGasUsed,
        receiptEffectiveGasPrice: txn.receipt.effectiveGasPrice,
        receiptGasUsed: txn.receipt.gasUsed,
        receiptLogsBloom: txn.receipt.logsBloom,
        methodId: txn.input.length >= 10 ? txn.input.slice(0, 10) : null
      });

      // save logs
      txn.receipt.logs.forEach((log) => {
        saveLogs.push({
          txnHash: txn.hash,
          contractAddr: log.address,
          topics: log.topics,
          data: log.data,
          logIndex: parseInt(log.logIndex),
        });
      });
    };
  });

  await saveTxnsToDb(saveTxns, chainId);
  saveLogsToDb(saveLogs, chainId);
}

// todo: check if locked consumer is consuming. if not unlock it
const _consumeAllPendingBlocksForChain = async (chainId) => {
  if (isConsuming[chainId]) return;

  try {
    let blockNumber = await popBlock(chainId);
    if (!blockNumber) return;

    isConsuming[chainId] = true;

    let multiBlocks = [];
    while (blockNumber) {
      // save txns with receipt
      const receipts = await getBlockReceipts(chainId, blockNumber);
      await saveTxnsWithReceipt(chainId, blockNumber, receipts);

      multiBlocks.push(
        rpc[chainId].geth
          ? _consumeBlockGeth(chainId, parseInt(blockNumber))
          : _consumeBlock(chainId, blockNumber, receipts),
      );
      if (multiBlocks.length > 20) {
        console.log(`waiting ${chainId}`);
        await Promise.allSettled(multiBlocks);
        multiBlocks = [];
      }

      blockNumber = await popBlock(chainId);
    }
  } catch (e) {
    console.error("_consumeAllPendingBlocksForChain", e);
  } finally {
    isConsuming[chainId] = false;
  }
};

/**
 * @param {boolean} isOldBlocks used to track old blocks for a chain, making things retroactive
 */
const _consumeBlock = async (chainId, blockNumber, receipts, isOldBlocks) => {
  try {
    // simply log the error, everything is handled in catch block
    if (!receipts?.length) {
      console.log("null block", chainId, blockNumber);
      return;
      // throw new Error("null block");
    }

    let processingTxns = [];
    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i];

      receipt.from = ethers.utils.getAddress(receipt.from);
      // if null, txn is for creating contract where contractAddress contains the details
      receipt.to = ethers.utils.getAddress(receipt.to || receipt.contractAddress);
      receipt.status = parseInt(receipt.status);

      // if txn failed don't process it
      if (receipt.status != 1) continue;

      // process the txn for event
      const eventProcessors = eventIndexer.consumeReceiptForEvent(
        task,
        trackEvents,
        chainId,
        receipt,
      );
      if (eventProcessors?.length) processingTxns.push(...eventProcessors);

      const txnProcessor = txnIndexer.consumeReceiptForTxn(task, trackTxns, chainId, receipt);
      if (txnProcessor) processingTxns.push(txnProcessor);

      // todo: use bottleneck instead of promise
      if (processingTxns.length <= 30) continue;
      await Promise.allSettled(processingTxns);
      processingTxns = [];
    }

    // track consumed block
    addProcessedBlockQueue(chainId, blockNumber).catch((e) =>
      console.error(`could not save processed block ${chainId}:${blockNumber}`, e),
    );
  } catch (e) {
    console.error(`could not consume block ${chainId}::${blockNumber}`, e);
    // no need to republish old blocks
    if (isOldBlocks) return;

    // debounce timer
    if (!delayed[chainId]) delayed[chainId] = {};
    if (!delayed[chainId][blockNumber]) delayed[chainId][blockNumber] = 0;
    delayed[chainId][blockNumber]++;

    if (delayed[chainId][blockNumber] < 1) {
      setTimeout(() => {
        addBlocksQueue(chainId, [blockNumber]).catch((e) =>
          console.error("error republishing errored consumed block", e),
        );
      }, 10000 * delayed[chainId][blockNumber]);
    } else {
      delete delayed[chainId][blockNumber];
      console.log("ignoring null block after multiple retries", chainId, blockNumber);
    }
  }
};

/**
 * @param {boolean} isOldBlocks used to track old blocks for a chain, making things retroactive
 */
const _consumeBlockGeth = async (chainId, blockNumber, isOldBlocks) => {
  try {
    const txns = await getBlockTransactions(chainId, blockNumber);

    // simply log the error, everything is handled in catch block
    if (!txns?.length) {
      console.log("null block", chainId, blockNumber);
      return;
      // throw new Error("null block");
    }

    let processingTxns = [];
    for (let i = 0; i < txns.length; i++) {
      const txn = txns[i];

      txn.from = ethers.utils.getAddress(txn.from || ethers.constants.AddressZero);
      // if null, txn is for creating contract where contractAddress contains the details
      txn.to = ethers.utils.getAddress(
        txn.to || txn.contractAddress || ethers.constants.AddressZero,
      );

      // @IMPORTANT: NOT PROCESSING EVENTS FOR GETH NODES as it is expensive
      // process the txn for event
      // const eventProcessors = eventIndexer.consumeReceiptForEvent(task, trackEvents, chainId, receipt);
      // if (eventProcessors?.length) processingTxns.push(...eventProcessors);

      const txnProcessor = txnIndexer.consumeTxnGeth(task, trackTxns, chainId, txn);
      if (txnProcessor) processingTxns.push(txnProcessor);

      // todo: use bottleneck instead of promise
      if (processingTxns.length <= 30) continue;
      await Promise.allSettled(processingTxns);
      processingTxns = [];
    }

    // track consumed block
    addProcessedBlockQueue(chainId, blockNumber).catch((e) =>
      console.error(`could not save processed block ${chainId}:${blockNumber}`, e),
    );
  } catch (e) {
    console.error(`could not consume block ${chainId}::${blockNumber}`, e);
    // no need to republish old blocks
    if (isOldBlocks) return;

    // debounce timer
    if (!delayed[chainId]) delayed[chainId] = {};
    if (!delayed[chainId][blockNumber]) delayed[chainId][blockNumber] = 0;
    delayed[chainId][blockNumber]++;

    if (delayed[chainId][blockNumber] < 1) {
      setTimeout(() => {
        addBlocksQueue(chainId, [blockNumber]).catch((e) =>
          console.error("error republishing errored consumed block", e),
        );
      }, 10000 * delayed[chainId][blockNumber]);
    } else {
      delete delayed[chainId][blockNumber];
      console.log("ignoring null block after multiple retries", chainId, blockNumber);
    }
  }
};

const saveConsumedBlockToDbJob = async () => {
  blockConsumerJobs.saveConsumedBlockToDb = setInterval(async () => {
    if (isConsuming.saveConsumedBlockToDb) return;
    try {
      isConsuming.saveConsumedBlockToDb = true;
      const consumedBlocks = await getProcessedBlockQueue();
      if (consumedBlocks?.length) {
        // await db.blocksTracked.insertMany(consumedBlocks, { ordered: false });
        
        consumedBlocks.forEach((block) => {
          const newBlockChainId = `${block.chainId}`;
          const newBlockNumber = `${block.blockNumber}`;

          if (
            !latestBlock[newBlockChainId] ||
            latestBlock[newBlockChainId] < newBlockNumber
          )
            latestBlock[newBlockChainId] = newBlockNumber;
        });
      }
    } catch (e) {
      console.error("could not save consumed blocks to db", e);
    } finally {
      isConsuming.saveConsumedBlockToDb = false;
    }
  }, dateMillis.min_1);
};

const populateTaskConfig = async () => {
  try {
    const configs = await db.indexerConfig.find({}).toArray();

    // clear old task
    Object.keys(task).forEach((key) => {
      delete task[key];
    });
    Object.keys(trackTxns).forEach((key) => {
      delete trackTxns[key];
    });
    Object.keys(trackEvents).forEach((key) => {
      delete trackEvents[key];
    });

    // assign new task values

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      switch (config.type) {
        case id.mongodb.indexerConfigType.task: {
          task[config._id] = _prepareTaskConfig(config);
          break;
        }
        case id.mongodb.indexerConfigType.chainTask: {
          if (!trackTxns[config.chainId]) trackTxns[config.chainId] = {};
          trackTxns[config.chainId][config.contractAddress] = config;
          break;
        }
        case id.mongodb.indexerConfigType.eventTask: {
          if (!trackEvents[config.chainId]) trackEvents[config.chainId] = {};
          if (!trackEvents[config.chainId][config.contractAddress])
            trackEvents[config.chainId][config.contractAddress] = [];

          trackEvents[config.chainId][config.contractAddress].push(config);
          break;
        }
      }
    }
  } catch (e) {
    console.error("could not get indexer task config", e);
  }
};

const _prepareTaskConfig = (task) => {
  if (task.integrators) {
    task.integrators = new Set(task.integrators?.map((v) => v.toLowerCase()));
  }
  switch (task.abi) {
    case "lifiDiamondAbi": {
      break;
    }
    case "cowswapGpV2SettlementAbi": {
      break;
    }
    case "cowswapEthFlowAbi": {
      break;
    }
    case "yatNftAbi": {
      break;
    }
    case "poapAbi": {
      task.eventIds = new Set(task.eventIds || []);
      break;
    }
  }
  return task;
};

module.exports = { init, populateTaskConfig, _consumeBlock, latestBlock };
