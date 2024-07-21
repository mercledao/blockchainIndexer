const { rpc, dateMillis } = require('../constants');
const psqlHelper = require('./psqlHelper');

const blockConsumer = require('./indexer/blockConsumer');

const trackOldBlocks = async (startDate) => {
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

        fetchBlocksForChain(chainId, startDate);
    }
};

const fetchBlocksForChain = async (chainId, startDate) => {
    try {
        // we want to track till the first block stored in the db
        const endBlock = await psqlHelper.getFirstTrackedBlock(chainId);
        // estimate the start block using blocks per day.
        const startBlock = 1;

        // hardcap sleep time to make things more efficient for slower chains like eth
        const sleepTime = Math.min(rpc[chainId].consumeRate, dateMillis.sec_1 * 10);
        const limit = 15;
        let processing = 0;
        for (let i = startBlock; i < endBlock; i++) {
            /**
             * active sleeping is more efficient than waiting for array of promises (which waits for last promise to complete even though earlier promises have settled)
             * this is also better than bottleneck lib where we have to create all the function instances during initialization which eats all the memory.
             */
            while (processing > limit) {
                await _sleep(sleepTime);
            }

            blockConsumer
                ._consumeBlockAny(chainId, i, true)
                .catch((e) => console.error(e))
                .finally(() => processing--);

            processing++;
        }
    } catch (e) {
        console.error(e);
    }
};

const _sleep = async (sleepTime) => {
    return new Promise((res) => setTimeout(res, sleepTime));
};

module.exports = { trackOldBlocks };
