const { enumsComplex, enums } = require("../../../constants");
const splitProtocolParser = require("./splitProtocolParser");
const dataPublisher = require("../../indexer/dataPublisherHelper");

const processTxn = async ({ task, txn, tagsFound }) => {
  const transfers = splitProtocolParser.getTransfers({ txn });

  // we are tracking everything
  // we only need to track transfers atm. so no need to parse args as amount usd is not required.
  const data = { transfers };

  dataPublisher.pushData({
    task,
    txn,
    data,
    taskType: enumsComplex.EventTypes.SplitRouterMev.name,
    amountUsd: 0,
    tag: enums.TaskTag.mev,
  });
};

module.exports = { processTxn };
