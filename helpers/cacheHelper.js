const { createClient } = require("redis");
const { dateMillis, id } = require("../constants");

let redisClient;
const voidSignersPool = {}; // has array of void sigers for chain
const providersPool = {}; // has array of providers for chain
const providersPoolIndex = {}; // index of provider for chain
const lastTrackedBlocks = {};

// indexer config for tracking
const task = {};
const trackTxns = {};
const trackEvents = {};

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
    await redisClient.sendCommand(["hset", key, "value", JSON.stringify(value) || ""]);
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

// txn queue management. txn is not ordered
const addTxnQueue = async (txnPayload) => {
  try {
    await redisClient.sendCommand([
      "hset",
      id.redis.txnQueue,
      id.redis.txnQueueItem(txnPayload),
      JSON.stringify(txnPayload) || "",
    ]);
  } catch (e) {
    console.error(e);
  }
};
// txn queue management. txn is not ordered
const getTxnQueue = async () => {
  try {
    const data = await redisClient.multi().hGetAll(id.redis.txnQueue).del(id.redis.txnQueue).execAsPipeline();
    return Object.values(data[0]).map(JSON.parse);
  } catch (e) {
    console.error(e);
  }
  return [];
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
  console.log("qlen: ", len);
  return len;
}

// only use this to reinitialize the blocks queue
const clearBlocksQueue = async (chainId) => {
  try {
    await redisClient.del(id.redis.blocksQueue(chainId));
    // todo: maybe clear processing block queue as well?
  } catch (e) {
    console.error(e);
  }
};

// txn queue management. txn is not ordered
const addProcessedBlockQueue = async (chainId, blockNumber) => {
  try {
    await redisClient.hSet(
      id.redis.processedBlocksQueue,
      id.redis.processedBlocksQueueItem(chainId, blockNumber),
      JSON.stringify({ chainId, blockNumber, cAt: Date.now() }) || ""
    );
  } catch (e) {
    console.error(e);
  }
};
// txn queue management. txn is not ordered
const getProcessedBlockQueue = async () => {
  try {
    const data = await redisClient
      .multi()
      .hGetAll(id.redis.processedBlocksQueue)
      .del(id.redis.processedBlocksQueue)
      .execAsPipeline();
    return Object.values(data[0]).map(JSON.parse);
  } catch (e) {
    console.error(e);
  }
  return [];
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
  task,
  trackTxns,
  trackEvents,

  setDataJson,
  getDataJson,

  addTxnQueue,
  getTxnQueue,

  addBlocksQueue,
  popBlock,
  clearBlocksQueue,

  addProcessedBlockQueue,
  getProcessedBlockQueue,

  delKey,
  printLength
};
