const { ethers } = require("ethers");
const tokenRewardDistributorAbi = require("../../abi/tokenback/TokenRewardDistributor.json");
const { enums, psql, dateMillis } = require("../../constants");
const { db } = require("../mongoHelper");
const psqlHelper = require("../psqlHelper");
const cacheHelper = require("../cacheHelper");
const tokenPriceHelper = require("../tokenPrice/tokenPriceHelper");
const utils = require("../utils");
const alchemyHelper = require("../alchemyHelper");
const ethersHelper = require("../ethersHelper");

/**
 * @param {txn} indexedTxn (hash, blockId, chainId, from, to, abi, data)
 * @param {taskType} enumsComplex.EventTypes.LifiBridge.name
 * @param {amountUsd} trade/swap/bridge amount in usd
 * @param {realFrom} address may be different from txn.from. Eg, cowswap trades can be routed through routers
 * which will have router address in txn.from. realFrom is the address of the user who created the order
 */
const trackTokenBack = async ({ txn, taskType, amountUsd, realFrom, integrator, tag }) => {
  try {
    const query = {
      "events.type": taskType,
      [`events.${taskType}.subTaskConfig.rewardDistributor`]: { $exists: true },
      [`events.${taskType}.subTaskConfig.rewardDistributor.tags`]: tag,
      // [`events.${taskType}.subTaskConfig.rewardDistributor.integrator`]: integrator?.toLowerCase(),
    };
    if (integrator) {
      query[`events.${taskType}.subTaskConfig.rewardDistributor.integrator`] = integrator?.toLowerCase();
    }

    const events = await db.events
      .find(query, {
        projection: {
          events: 1,
        },
      })
      .toArray();

    let promises = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const task = event.events.find((task) => task.type == taskType);

      // if isTokenBack is true, then dont auto track it. verify api is called to update tokenback
      if (!task || task?.[task.type]?.isTokenBack) {
        continue;
      }

      promises.push(_insertEstimateTokenBack({ txn, task, amountUsd, realFrom }));

      if (promises.length > 10) {
        await Promise.allSettled(promises);
        promises = [];
      }
    }
    if (promises.length) {
      await Promise.allSettled(promises);
    }
  } catch (e) {
    console.error(`could not trackTokenBack ${txn.hash}`, e);
  }
};

/**
 * @param {realFrom} address may be different from txn.from. Eg, cowswap trades can be routed through routers
 * which will have router address in txn.from. realFrom is the address of the user who created the order
 */
const _insertEstimateTokenBack = async ({ txn, task, amountUsd = 0, realFrom }) => {
  try {
    const nftAddress = task.tokenAddr;
    const nftChainId = task.chainId;
    let tokenId = null;
    try {
      tokenId = await alchemyHelper.getTokenId(txn.from, nftAddress, nftChainId);
    } catch (e) {
      // no-op
    }

    const config = await _getTokenbackConfig(task);

    const tokenBackUsd = (amountUsd * config.bps) / 1000000;
    const rewardTokenUsd = await tokenPriceHelper.getUsdPriceOf({
      chainId: config.chainId,
      tokenAddress: config.tokenAddress,
    });
    const tokenBack = tokenBackUsd / rewardTokenUsd;

    const data = {
      txnHash: txn.hash,
      blockId: txn.blockId,
      chainId: txn.chainId,
      taskId: task.id,
      from: realFrom || txn.from,
      to: txn.to,
      abi: txn.abi,
      tokenAddress: config.tokenAddress,
      tokenRate: 1 / rewardTokenUsd,
      amountUsd,
      bps: config.bps,
      tokenBack,
      nftAddress,
      nftChainId,
      tokenId,
    };

    await _insertTokenBack(data);
  } catch (e) {
    console.error(`Could not _insertEstimateTokenBack ${txn.hash}`, e);
  }
};

const _getTokenbackConfig = async (task) => {
  const cachekey = utils.hashObject({ taskId: task.id, func: "_getTokenbackConfig" });
  const cached = await cacheHelper.getDataJson(cachekey);
  if (cached) return cached;

  const rewardDistributorConfig = task[task.type].subTaskConfig.rewardDistributor;

  const rewardDistributor = new ethers.Contract(
    rewardDistributorConfig.tokenAddress,
    tokenRewardDistributorAbi,
    ethersHelper.getVoidSigner(rewardDistributorConfig.chainId)
  );

  const _config = await rewardDistributor.campaigns(utils.bsonIdToBytes12(task.id));
  const config = {
    tokenAddress: _config[0],
    taskid: _config[1],
    bps: parseInt(_config[2].toString()),
    chainId: rewardDistributorConfig.chainId,
  };
  cacheHelper.setDataJson(cachekey, config, dateMillis.hour_1 * 2);

  return config;
};

const _insertTokenBack = async (data) => {
  const tableDetails = psql.tables.tokenBack;
  const row = {
    [tableDetails.columns.txnHash.as]: data.txnHash,
    [tableDetails.columns.blockId.as]: data.blockId,
    [tableDetails.columns.chainId.as]: data.chainId,
    [tableDetails.columns.taskId.as]: data.taskId,
    [tableDetails.columns.from.as]: data.from,
    [tableDetails.columns.to.as]: data.to,
    [tableDetails.columns.abi.as]: data.abi,
    [tableDetails.columns.tokenAddress.as]: data.tokenAddress,
    [tableDetails.columns.tokenRate.as]: data.tokenRate,
    [tableDetails.columns.amountUsd.as]: data.amountUsd,
    [tableDetails.columns.bps.as]: data.bps,
    [tableDetails.columns.tokenBack.as]: data.tokenBack,
    [tableDetails.columns.createdAt.as]: new Date(),
  };
  await psqlHelper.insert({
    tableDetails,
    row,
    onConflictKeys: [tableDetails.columns.txnHash.field, tableDetails.columns.chainId.field],
  });
};

module.exports = { trackTokenBack };
