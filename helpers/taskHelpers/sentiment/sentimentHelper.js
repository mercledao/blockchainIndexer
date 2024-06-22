const { enumsComplex } = require("../../../constants");
const dataPublisher = require("../../indexer/dataPublisherHelper");
const parserImpl = require("./sentimentPraser");

const processEvent = async ({ task, event, events, chainId, contractDetails, contract }) => {
  const parser = parserImpl[event.event];
  if (!parser) return;

  // create txn like data
  const txns = await parser({ events, chainId, contract });

  if (!txns?.length) return;

  txns.forEach(({ txn, data }) => {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.BalanceHistory.name, // is nullable
      amountUsd: 0,
      realFrom: data.realFrom, // is nullable
      tag: task.tag || data.tag,
      contractDetails,
      isBalanceHistory: true,
    });
  });
};

module.exports = { processEvent };
