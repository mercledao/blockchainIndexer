const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex } = require("../../../constants");
const reaxParser = require("./reaxParser");

const processTxn = async ({ task, txn, tagsFound }) => {
  let data;
  if (txn.parsedTxn) {
    const parser = reaxParser[txn.to]?.[txn.parsedTxn.name];
    if (!parser) return;
    data = await parser?.({ txn });
  } else {
    // probably a swap call. parse log
    data = await reaxParser[txn.to].noAbi({ task, txn });
    if (!data?.parsedLogs?.length) return;
  }

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
