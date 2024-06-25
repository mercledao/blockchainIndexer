const { ethers } = require("ethers");
const cacheHelper = require("../cacheHelper");
const { db } = require("../mongoHelper");
const { dateMillis } = require("../../constants");
const tokenbackHelper = require("../tokenbackHelpers/tokenbackHelper");
const balanceHistoryHelper = require("../balanceHistoryHelper");
const webhookHelper = require("../webhook/webhookHelper");
const zooltestnetHelper = require("../zooltestnet/zooltestnetHelper");

const init = async () => {
  setInterval(() => {
    _saveData();
  }, dateMillis.min_1);
};

/**
 * @param {taskType} enumsComplex.EventTypes.LifiBridge.name mercle task type
 * @param {realFrom} address may be different from txn.from. Eg, cowswap trades can be routed through routers
 * which will have router address in txn.from. realFrom is the address of the user who created the order
 * @param {tag} enums.TaskTag tag to track
 * @param {integrator} dapp which was used to perform the txn. Eg SS for cowswap
 * @param {contractDetails} nullable it is required for eventTask for webhook
 * @param {boolean} isBalanceHistory if true, will insert into psql balance history table
 */
const pushData = ({
  task,
  txn,
  data,
  taskType,
  amountUsd,
  realFrom,
  integrator,
  tag,
  contractDetails,
  isBalanceHistory = false,
}) => {
  // minor cleanup
  if ("tag" in data) delete data.tag;
  if ("amountUsd" in data) delete data.amountUsd;

  // create payload
  const payload = {
    hash: txn.hash,
    from: txn.from,
    to: txn.to,
    chainId: txn.chainId,
    blockId: txn.blockNumber,
    value: parseFloat(ethers.utils.formatEther(txn.value)),
    cAt: Date.now(),
    abi: task.abi,
    methodName: txn?.parsedTxn?.name,
    data,
    amountUsd: parseFloat(amountUsd || 0),
    realFrom: realFrom || txn.from,
    integrator,
    tag,
  };

  // set txnOrigin as array for easier search on both values
  const txnOrigin = new Set([payload.from]);
  if (payload.realFrom) txnOrigin.add(payload.realFrom);
  payload.txnOrigin = Array.from(txnOrigin);

  cacheHelper.addTxnQueue(payload);

  tokenbackHelper.trackTokenBack({ txn: payload, taskType, amountUsd, realFrom, integrator, tag });

  // webhookHelper.callWebhook({ task, payload, contractDetails });

  if (isBalanceHistory) balanceHistoryHelper.trackBalanceHistory({ data });
};

const _saveData = async () => {
  try {
    const txns = await cacheHelper.getTxnQueue();
    if (txns.length) {
      zooltestnetHelper.indexDataBatch(txns)

      // await db.indexer.insertMany(txns, { ordered: false });
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports = { init, pushData };
