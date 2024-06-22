const { enumsComplex, enums } = require("../../constants");
const dataPublisher = require("../indexer/dataPublisherHelper");

const processYat = async ({ task, txn, tagsFound }) => {
  if (tagsFound.has("mint")) {
    const data = {
      receiver: txn.parsedTxn.args[1],
    };
    dataPublisher.pushData({ task, txn, data, tag: enums.TaskTag.mint });
  } else if (tagsFound.has("transfer")) {
    const data = {
      from: txn.parsedTxn.args[0],
      to: txn.parsedTxn.args[1],
      tokenId: parseInt(txn.parsedTxn.args[2].toString()),
    };
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.HoldNFT.name,
      tag: enums.TaskTag.transfer,
    });
  }
};

module.exports = { processYat };
