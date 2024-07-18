const { rpc } = require('../../constants');
const { getProvider } = require('../ethersHelper');
const { lastTrackedBlocks, addBlocksQueue, clearBlocksQueue } = require('../cacheHelper');

const blockProducerJobs = { maintain: {} };
const lockProducer = {};
const { _getLastTrackedBlocksDb } = require('../psqlHelper');

const init = async () => {
    await produceBlock();
};

/**
 * produce new blocks
 */
const produceBlock = async () => {
    // const dbTrackedBlocks = await _getLastTrackedBlocksDb();
    const dbTrackedBlocks = await _getLastTrackedBlocksDb();
    const supportedChains = Object.keys(rpc);

    // track missed blocks
    for (let i = 0; i < supportedChains.length; i++) {
        const chainId = supportedChains[i];
        await clearBlocksQueue(chainId);
        lastTrackedBlocks[chainId] = dbTrackedBlocks[chainId];
    }

    // track new blocks
    for (let i = 0; i < supportedChains.length; i++) {
        const chainId = supportedChains[i];
        blockProducerJobs[chainId] = setInterval(
            () => _produceBlockForChain(chainId),
            rpc[chainId].pollRate,
        );
    }
};

// todo: need to check if locked producer is still producing blocks or not. if not unlock it
const _produceBlockForChain = async (chainId) => {
    if (lockProducer[chainId]) return;
    lockProducer[chainId] = true;

    let nextTrackBlock = lastTrackedBlocks[chainId]
        ? parseInt(lastTrackedBlocks[chainId]) + 1
        : undefined;

    try {
        const blockNumber = (await getProvider(chainId).getBlockNumber()) - 1; // lag by 1 blocks
        if (!blockNumber) return;
        if (nextTrackBlock >= blockNumber) return;
        if (!nextTrackBlock) nextTrackBlock = blockNumber;

        const blocks = [];
        // ignore blocks if lagging behind by more than 1000 blocks
        for (
            let i = blockNumber - nextTrackBlock > 1000 ? blockNumber : nextTrackBlock;
            i <= blockNumber;
            i++
        ) {
            blocks.push(`${i}`);
        }
        blocks.push(`${blockNumber}`);

        if (blocks.length) {
            lastTrackedBlocks[chainId] = blockNumber;
            await addBlocksQueue(chainId, blocks);
        }
    } catch (e) {
        console.error(`could not produce block since::${chainId}::${nextTrackBlock}`, e);
    } finally {
        lockProducer[chainId] = false;
    }
};

/**
 * used to track historic blocks for a chain
 * @param {string[]} blocks
 */
const produceOldBlocks = async (chainId, blocks) => {
    try {
        await addBlocksQueue(chainId, blocks);
        console.log('produceOldBlocks for', chainId, 'count', blocks.length);
    } catch (e) {
        console.error("couldn't produceOldBlocks", e);
    }
};

module.exports = { init, produceOldBlocks };
