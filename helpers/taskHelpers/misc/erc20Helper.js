const { enumsComplex } = require("../../../constants");
const dataPublisher = require("../../indexer/dataPublisherHelper");
const parserImpl = require("./erc20Praser");

const processEvent = async ({ task, event, events, chainId, contractDetails }) => {
  const parser = parserImpl[event.event];
  if (!parser) return;

  // create txn like data
  const txns = await parser({ events, chainId });

  if (!txns?.length) return;

  txns.forEach(({ txn, data }) => {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.Erc20Transfer.name, // is nullable
      amountUsd: 0,
      realFrom: data.realFrom, // is nullable
      tag: task.tag || data.tag,
      contractDetails,
    });
  });
};

module.exports = { processEvent };
