const { enumsComplex, enums } = require("../../../constants");
const idleTokenParser = require("./idleTokenParser");
const dataPublisher = require("../../indexer/dataPublisherHelper");

const processTxn = async ({ task, txn, tagsFound }) => {
  const parser = idleTokenParser[txn.parsedTxn.name];
  if (!parser) {
    console.log("##### PARSER NOT FOUND ######\n", txn.parsedTxn.name, txn.hash, "\n############################\n");
    return;
  }

  const data = await parser?.({ txn });

  const isAffiliate = task.integrators?.has(data.referral.toLowerCase());
  const shouldTrack = isAffiliate;
  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.IdleToken.name,
      amountUsd: data.amountUsd,
      integrator: data?.referral?.toLowerCase(),
      tag: enums.TaskTag.stake,
    });
  }
};

module.exports = { processTxn };
