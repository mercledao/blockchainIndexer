const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex } = require("../../../constants");
const zksyncParser = require("./zksyncParser");

const processTxn = async ({ task, txn, tagsFound }) => {
  let data;
  const parser = zksyncParser[txn.parsedTxn.name];
  if (!parser) return;
  data = await parser?.({ txn });

  const shouldTrack = data;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.Reax.name,
      amountUsd: data.amountUsd,
      realFrom: data.realFrom, // is nullable
      tag: data.tag,
    });
  }
};

module.exports = { processTxn };
