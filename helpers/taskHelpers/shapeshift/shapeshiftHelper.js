const { enumsComplex, enums } = require("../../../constants");
const ssIdleParser = require("./ssIdleParser");
const dataPublisher = require("../../indexer/dataPublisherHelper");

const processIdleFinCdoTxn = async ({ task, txn, tagsFound }) => {
  const parser = ssIdleParser[txn.parsedTxn.name];
  if (!parser) {
    console.log("##### PARSER NOT FOUND ######\n", txn.parsedTxn.name, txn.hash, "\n############################\n");
    return;
  }

  const data = await parser?.({ txn });

  const isAffiliate = true;
  const shouldTrack = isAffiliate;
  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.SsIdleCdo.name,
      amountUsd: data.amountUsd,
      tag: enums.TaskTag.stake,
    });
  }
};

module.exports = { processIdleFinCdoTxn };
