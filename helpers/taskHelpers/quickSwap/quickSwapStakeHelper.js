const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex } = require("../../../constants");
const quickSwapStakeParser = require("./quickSwapStakeParser");

const processTxn = async ({ task, txn, tagsFound }) => {
  let data;
  const parser = quickSwapStakeParser[txn.parsedTxn.name];
  if (!parser) return;
  data = await parser?.({ txn });

  const shouldTrack = data;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.QuickSwapSwap.name,
      amountUsd: data.amountUsd,
      realFrom: data.realFrom, // is nullable
      tag: data.tag,
    });
  }
};

module.exports = { processTxn };
