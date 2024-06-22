const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex } = require("../../../constants");
const blastParser = require("./berachainParser");

const processTxn = async ({ task, txn, tagsFound }) => {
  let data;

  const parser = blastParser[txn.parsedTxn.name];
  if (!parser) return;
  data = await parser?.({ txn });

  const shouldTrack = data;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.Berachain.name,
      amountUsd: data.amountUsd,
      realFrom: data.realFrom, // is nullable
      tag: data.tag,
    });
  }
};

module.exports = { processTxn };
