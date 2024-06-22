const zeroXParser = require("./zeroXParser");
const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex, enums } = require("../../../constants");
const transformHelper = require("./transformHelper");

const affiliateParserName = transformHelper.parseAffiliateFeeTransformer.name;

const processTxn = async ({ task, txn, tagsFound }) => {
  const parser = zeroXParser?.[txn.parsedTxn.name];
  if (!parser) {
    console.log("##### PARSER NOT FOUND ######\n", txn.parsedTxn.name, txn.hash, "\n############################\n");
    return;
  }
  const data = await zeroXParser?.[txn.parsedTxn.name]?.({ txn });

  const isAffiliate = data.transformations
    .find(
      (transformation) =>
        transformation.decoded?.parserName == affiliateParserName &&
        task.integrators.has(transformation.decoded?.data?.[0]?.recipient?.toLowerCase())
    )
    ?.decoded?.data?.[0]?.recipient?.toLowerCase();

  // no need to store this in db
  if (data.transformations) {
    delete data.transformations;
  }

  const shouldTrack = isAffiliate;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.ZeroEx.name,
      amountUsd: data.amountUsd,
      integrator: isAffiliate,
      tag: enums.TaskTag.swap,
    });
  }
};

module.exports = { processTxn };
