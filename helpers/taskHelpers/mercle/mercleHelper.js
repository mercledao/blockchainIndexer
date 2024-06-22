const { enumsComplex } = require("../../../constants");
const dataPublisher = require("../../indexer/dataPublisherHelper");
const mercleParser = require("./mercleParser");

const processEvent = async ({ task, event, chainId, contractDetails }) => {
  const parser = mercleParser[event.event];
  if (!parser) {
    console.error(`mercleParser not found for event ${event.event}`, JSON.stringify(task), event.event);
    return;
  }

  // create txn like data
  const { txn, data } = await parser({ event });
  txn.chainId = chainId;
  txn.parsedTxn = { name: `event:${task.eventName}` };
  txn.value = 0;

  if (!data) return;

  dataPublisher.pushData({
    task,
    txn,
    data,
    taskType: enumsComplex.EventTypes.MercleNftMint.name, // is nullable
    amountUsd: 0,
    realFrom: data.realFrom, // is nullable
    tag: task.tag || data.tag,
    contractDetails,
  });
};

module.exports = { processEvent };
