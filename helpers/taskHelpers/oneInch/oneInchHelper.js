const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex, enums } = require("../../../constants");
const oneInchParserV4 = require("./oneInchParserV4");
const oneInchParserV5 = require("./oneInchParserV5");
const oneInchUtils = require("./oneInchUtils");

const processTxnV4 = async ({ task, txn, tagsFound }) => {
  const parser = oneInchParserV4[txn.parsedTxn.name];
  if (!parser) {
    console.log("##### PARSER NOT FOUND ######\n", txn.parsedTxn.name, txn.hash, "\n############################\n");
    return;
  }

  const data = await parser?.({ txn });

  const affiliateTransfer = oneInchUtils.findAffiliate({ task, txn });

  const shouldTrack = affiliateTransfer;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.OneInch.name,
      amountUsd: data.amountUsd,
      integrator: affiliateTransfer.to.toLowerCase(),
      tag: enums.TaskTag.swap,
    });
  }
};

const processTxnV5 = async ({ task, txn, tagsFound }) => {
  const parser = oneInchParserV5[txn.parsedTxn.name];
  if (!parser) {
    console.log("##### PARSER NOT FOUND ######\n", txn.parsedTxn.name, txn.hash, "\n############################\n");
    return;
  }

  const data = await parser?.({ txn });

  const affiliateTransfer = oneInchUtils.findAffiliate({ task, txn });

  const shouldTrack = affiliateTransfer;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.OneInch.name,
      amountUsd: data.amountUsd,
      integrator: affiliateTransfer.to.toLowerCase(),
      tag: enums.TaskTag.swap,
    });
  }
};

module.exports = { processTxnV4, processTxnV5 };
