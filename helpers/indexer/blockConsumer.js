const { ZeroAddress, rpc, dateMillis } = require('../../constants');
const { getBlockReceipts, getBlockTransactions, getTxnReceipt } = require('../ethersHelper');
const { popBlock, addBlocksQueue } = require('../cacheHelper');
const { saveTxnsToDb, saveLogsToDb } = require('../psqlHelper');

const blockConsumerJobs = {};
const saveToDbJobs = {};
const isConsuming = {};
const delayed = {}; // delay blocknumber

// todo: move this to redis?
const toSaveTxns = {};
const toSaveLogs = {};

const init = async () => {
    await consumeBlockJob();
    await saveToDbJob();
};

const consumeBlockJob = async () => {
    const supportedChains = Object.keys(rpc);

    // consume blocks
    for (let i = 0; i < supportedChains.length; i++) {
        const chainId = supportedChains[i];
        blockConsumerJobs[chainId] = setInterval(
            () => _consumeAllPendingBlocksForChain(chainId),
            rpc[chainId].consumeRate,
        );
    }
};

// todo: check if locked consumer is consuming. if not unlock it
const _consumeAllPendingBlocksForChain = async (chainId) => {
    if (isConsuming[chainId]) return;

    try {
        let blockNumber = await popBlock(chainId);
        if (!blockNumber) return;

        isConsuming[chainId] = true;

        while (blockNumber) {
            // save txns with receipt

            rpc[chainId].geth
                ? _consumeBlockGeth(chainId, blockNumber)
                : _consumeBlock(chainId, blockNumber);

            blockNumber = await popBlock(chainId);
        }
    } catch (e) {
        console.error('_consumeAllPendingBlocksForChain', chainId, e);
    } finally {
        isConsuming[chainId] = false;
    }
};

/**
 * @param {boolean} isOldBlocks used to track old blocks for a chain, making things retroactive
 */
const _consumeBlockGeth = async (chainId, blockNumber, isOldBlocks) => {
    return await _consumeBlockProcess(chainId, blockNumber, isOldBlocks, _fetchTxnsAndReceiptsGeth);
};

/**
 * @param {boolean} isOldBlocks used to track old blocks for a chain, making things retroactive
 */
const _consumeBlock = async (chainId, blockNumber, isOldBlocks) => {
    return await _consumeBlockProcess(chainId, blockNumber, isOldBlocks, _fetchTxnsAndReceipts);
};

const _consumeBlockProcess = async (chainId, blockNumber, isOldBlocks, txnFetchMethod) => {
    try {
        const { txns, receipts, timestamp } = await txnFetchMethod(
            chainId,
            blockNumber,
            isOldBlocks,
        );
        await _saveTxnsWithReceipt(chainId, receipts, txns, timestamp);
    } catch (e) {
        console.error(`could not consume block ${chainId}::${blockNumber}`, e);

        // debounce timer
        if (!delayed[chainId]) delayed[chainId] = {};
        if (!delayed[chainId][blockNumber]) delayed[chainId][blockNumber] = 0;
        delayed[chainId][blockNumber]++;

        if (delayed[chainId][blockNumber] <= 5) {
            setTimeout(() => {
                addBlocksQueue(chainId, [blockNumber]).catch((e) =>
                    console.error('error republishing errored consumed block', e),
                );
            }, rpc[chainId].consumeRate);
        } else {
            delete delayed[chainId][blockNumber];
            console.log('ignoring null block after multiple retries', chainId, blockNumber);
        }
    }
};

const _fetchTxnsAndReceiptsGeth = async (chainId, blockNumber, isOldBlocks) => {
    const { txns, timestamp } = await getBlockTransactions(chainId, parseInt(blockNumber)); // Grouped
    if (!txns?.length) {
        console.log('null block', chainId, blockNumber);
        return {};
    }
    const receipts = [];

    // todo: might be a performance concern. possible rpc rate limits and memory issue
    await Promise.allSettled(
        txns.map(async (txn) => {
            const receipt = await getTxnReceipt(chainId, txn.hash);
            receipts.push(receipt);
        }),
    );

    return { txns, receipts, timestamp };
};

const _fetchTxnsAndReceipts = async (chainId, blockNumber, isOldBlocks) => {
    const { txns, timestamp } = await getBlockTransactions(chainId, parseInt(blockNumber)); // Grouped
    if (!txns.length) {
        console.log('null block', chainId, blockNumber);
        return {};
    }
    const receipts = await getBlockReceipts(chainId, blockNumber);

    return { txns, receipts, timestamp };
};

const _saveTxnsWithReceipt = async (chainId, receipts, txns, timestamp) => {
    try {
        if (!txns?.length) return;
        if (!receipts?.length) return;

        const mp = {}; // Mapping txHash to Receipt

        if (!toSaveTxns[chainId]) toSaveTxns[chainId] = [];
        if (!toSaveLogs[chainId]) toSaveLogs[chainId] = [];

        // Start mapping
        receipts.forEach((receipt) => (mp[receipt?.transactionHash] = receipt));
        txns.forEach((tx) => (tx.receipt = mp[tx.hash]));

        // Save to db
        txns.forEach((txn) => {
            if (!txn) return;
            if (txn.receipt?.status != '0x1') return;

            // Only save when receipt status === "0x1"
            toSaveTxns[chainId].push({
                blockNumber: txn.blockNumber ? parseInt(txn.blockNumber) : 0,
                fromAddr: txn.from?.toLowerCase() || ZeroAddress,
                /**
                 * hack: if gas is too high just store as 1e18.
                 * can save this type as numeric but it occupies extra space and not sure if this is really important
                 */
                gas: txn.gas ? Math.min(parseInt(txn.gas), 1000000000000000000) : 0,
                gasPrice: txn.gasPrice ? parseInt(txn.gasPrice) : 0,
                maxFeePerGas: txn.maxFeePerGas ? parseInt(txn.maxFeePerGas) : 0,
                maxPriorityFeePerGas: txn.maxPriorityFeePerGas
                    ? parseInt(txn.maxPriorityFeePerGas)
                    : 0,
                txnHash: txn.hash,
                input: txn.input,
                nonce: txn.nonce ? parseInt(txn.nonce) : 0,
                toAddr: txn.to?.toLowerCase() || ZeroAddress,
                value: txn.value,
                type: txn.type ? parseInt(txn.type) : 0,
                chainId: chainId ? parseInt(chainId) : 0,
                receiptContractAddress: txn.receipt?.contractAddress,
                receiptCumulativeGasUsed: txn.receipt?.cumulativeGasUsed
                    ? parseInt(txn.receipt.cumulativeGasUsed)
                    : 0,
                receiptEffectiveGasPrice: txn.receipt?.effectiveGasPrice
                    ? parseInt(txn.receipt.effectiveGasPrice)
                    : 0,
                receiptGasUsed: txn.receipt?.gasUsed ? parseInt(txn.receipt.gasUsed) : 0,
                receiptLogsBloom: txn.receipt?.logsBloom,
                methodId: txn.input?.length >= 10 ? txn.input.slice(0, 10) : null,
                timestamp: timestamp ? parseInt(timestamp) : 0,
            });

            // save logs
            txn.receipt?.logs?.forEach((log) => {
                toSaveLogs[chainId].push({
                    txnHash: txn.hash,
                    fromAddr: txn.from,
                    contractAddr: log?.address,
                    topics: log?.topics,
                    data: log?.data,
                    logIndex: parseInt(log?.logIndex),
                });
            });
        });

        // immediately save to db if the data becomes to large
        if (toSaveTxns[chainId].length > 400 || toSaveLogs[chainId].length > 800)
            _saveToDb(chainId);
    } catch (err) {
        console.error('Error while saving txns with receipt.', chainId, timestamp, err.message);
    }
};

const saveToDbJob = async () => {
    const supportedChains = Object.keys(rpc);

    // consume blocks
    for (let i = 0; i < supportedChains.length; i++) {
        const chainId = supportedChains[i];
        saveToDbJobs[chainId] = setInterval(
            () => _saveToDb(chainId),
            dateMillis.sec_1 * 5 + Math.floor(Math.random() * 5), // slight offset to prevent all chain writes at once
        );
    }
};

/**
 * since nodejs is single threaded, we first get list from cache and then set the cache empty immediately.
 * this creates a copy of the cache while the consumer can still add to the new list
 */
const _saveToDb = async (chainId) => {
    if (toSaveTxns[chainId]?.length > 0) {
        const txns = toSaveTxns[chainId];
        toSaveTxns[chainId] = [];
        saveTxnsToDb(txns, chainId).catch((e) =>
            console.error(
                'Error while saving txns',
                chainId,
                'l:',
                txns?.length,
                'sb:',
                txns?.[0]?.blockNumber,
                'eb:',
                txns?.[txns?.length - 1]?.blockNumber,
                e,
            ),
        );
    }

    if (toSaveLogs[chainId]?.length > 0) {
        const logs = toSaveLogs[chainId];
        toSaveLogs[chainId] = [];
        saveLogsToDb(logs, chainId).catch((e) =>
            console.error('Error while saving logs', chainId, 'l:', logs?.length, e),
        );
    }
};

module.exports = { init, _consumeBlock };
