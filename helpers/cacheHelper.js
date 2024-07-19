const { createClient } = require('redis');
const { dateMillis, id } = require('../constants');

let redisClient;
const voidSignersPool = {}; // has array of void sigers for chain
const providersPool = {}; // has array of providers for chain
const providersPoolIndex = {}; // index of provider for chain
const lastTrackedBlocks = {};

const zooltestnet = { wallet: undefined };

const init = async () => {
    redisClient = createClient({
        socket: {
            port: process.env.REDIS_PORT,
            host: process.env.REDIS_HOST,
        },
        password: process.env.REDIS_PASSWORD,
    });
    redisClient.connect();
};

const setDataJson = async (key, value, expireMillis = dateMillis.day_1 * 3) => {
    try {
        await redisClient.sendCommand(['hset', key, 'value', JSON.stringify(value) || '']);
        await redisClient.expire(key, Math.floor(expireMillis / dateMillis.sec_1));
    } catch (e) {
        console.error(e);
    }
};

const getDataJson = async (key) => {
    try {
        const data = await redisClient.hGetAll(key);
        if (!data?.value) return undefined;
        return JSON.parse(data.value);
    } catch (e) {
        console.error(e);
    }
    return undefined;
};

const addBlocksQueue = async (chainId, blocks) => {
    try {
        await redisClient.rPush(id.redis.blocksQueue(chainId), blocks);
    } catch (e) {
        console.error(e);
    }
};

const popBlock = async (chainId) => {
    const blockNumber = await redisClient.lPop(id.redis.blocksQueue(chainId));
    return blockNumber;
};

const printLength = async (chainId) => {
    const len = await redisClient.LLEN(id.redis.blocksQueue(chainId));
    console.log('qlen: ', len);
    return len;
};

// only use this to reinitialize the blocks queue
const clearBlocksQueue = async (chainId) => {
    try {
        await redisClient.del(id.redis.blocksQueue(chainId));
        // todo: maybe clear processing block queue as well?
    } catch (e) {
        console.error(e);
    }
};

const delKey = async (key) => {
    try {
        await redisClient.del(key);
        return true;
    } catch (e) {
        console.error(e);
    }
    return false;
};

module.exports = {
    init,
    providersPool, // do not use this directly. use ethersHelper.getProvider()
    providersPoolIndex,
    voidSignersPool, // do not use this directly. use ethersHelper.getVoidSigner()
    zooltestnet,

    lastTrackedBlocks,

    setDataJson,
    getDataJson,

    addBlocksQueue,
    popBlock,
    clearBlocksQueue,

    delKey,
    printLength,
};
