const { rpc, dateMillis } = require('../constants');
const psqlHelper = require('./psqlHelper');
const blockConsumer = require('./indexer/blockConsumer');
const network = require('./network');

const trackOldBlocks = async (_chainId, startDate = Date.now() - dateMillis.year_1) => {
    /**
     * no need to produce block or anything,
     * just loop through the block and start consuming blocks.
     * can do for different chains all at once because all of them are different servers
     * and different rate limits
     */

    const supportedChains = Object.keys(rpc);

    // track missed blocks
    for (let i = 0; i < supportedChains.length; i++) {
        const chainId = supportedChains[i];

        // if chainId is provided only index that chain
        if (_chainId && _chainId != chainId) continue;

        _fetchBlocksForChain(chainId, startDate);
    }
    network
        .postOldBlockToDiscord(`**Old block index started** :: From Date:: ${new Date(startDate)}`)
        .catch((e) => console.error(e));
};

const _fetchBlocksForChain = async (chainId, startDate) => {
    try {
        // we want to track till the first block stored in the db
        const { blockNumber, timestamp } = await psqlHelper.getFirstTrackedBlockAndTime(chainId);
        const endBlock = blockNumber;
        const endDate = timestamp * 1000;

        // estimate the start block using blocks per day.
        const dateDiffDays = Math.floor(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / dateMillis.day_1,
        );
        // maybe diff is larger than the chain history itself, so we start from 1 in that case
        const startBlock = Math.max(endBlock - dateDiffDays * rpc[chainId].avgBlockRateDay, 1);

        const totalBlocks = endBlock - startBlock;

        // log the process has been started
        network
            .postOldBlockToDiscord(`**${chainId}** :: start at:: ${startBlock} end at: ${endBlock}`)
            .catch((e) => console.error(e));

        // hardcap sleep time to make things more efficient for slower chains like eth
        const sleepTime = Math.min(rpc[chainId].consumeRate, dateMillis.sec_1 * 10);
        const limit = 10;
        let processing = 0;
        let lastStatusUpdate = Date.now();

        for (let i = startBlock; i < endBlock; i++) {
            /**
             * active sleeping is more efficient than waiting for array of promises (which waits for last promise to complete even though earlier promises have settled)
             * this is also better than bottleneck lib where we have to create all the function instances during initialization which eats all the memory.
             */
            while (processing > limit) {
                console.log('sleeping', chainId, processing, limit);
                await _sleep(sleepTime);
            }

            blockConsumer
                ._consumeBlockAny(chainId, i, true)
                .catch((e) => console.error(e))
                .finally(() => processing--);

            processing++;

            // sending progress status to discord
            if (Date.now() - lastStatusUpdate > dateMillis.min_1) {
                network
                    .postOldBlockToDiscord(
                        `**${chainId}** :: progress:: ${
                            ((i - startBlock) / totalBlocks) * 100
                        } :: ${i}/${endBlock}`,
                    )
                    .catch((e) => console.error(e));
                lastStatusUpdate = Date.now();
            }
        }
    } catch (e) {
        console.error(e);
        network
            .postOldBlockToDiscord(`**${chainId}** :: errored: ${e.message}`)
            .catch((e) => console.error(e));
    }
};

const _sleep = async (sleepTime) => {
    return new Promise((res) => setTimeout(res, sleepTime));
};

module.exports = { trackOldBlocks };
