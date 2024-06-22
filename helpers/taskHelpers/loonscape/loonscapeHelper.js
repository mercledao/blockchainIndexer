const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex } = require("../../../constants");
const loonscapeParser = require("./loonscapeParser");

const processTxn = async ({ task, txn, tagsFound }) => {
  let data;
  const parser = loonscapeParser[txn.parsedTxn.name];
  if (!parser) return;
  data = await parser?.({ txn });

  const shouldTrack = data;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.Loonscape.name,
      amountUsd: data.amountUsd,
      realFrom: data.realFrom, // is nullable
      tag: data.tag,
    });
  }
};

module.exports = { processTxn };
