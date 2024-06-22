const { enumsComplex, enums } = require("../../constants");
const dataPublisher = require("../indexer/dataPublisherHelper");

const processPoap = ({ task, txn, tagsFound }) => {
  const data = {};
  let tag;
  switch (txn.parsedTxn.name) {
    case "mintEventToManyUsers": {
      data.eventId = parseInt(txn.parsedTxn.args[0].toString());
      data.tos = txn.parsedTxn.args[1];
      tag = enums.TaskTag.mint;
      break;
    }
    case "mintUserToManyEvents": {
      data.eventIds = txn.parsedTxn.args[0].map((eventId) => parseInt(eventId.toString()));
      data.to = txn.parsedTxn.args[1];
      tag = enums.TaskTag.mint;
      break;
    }
    case "mintToken": {
      // normal mints
      data.eventId = parseInt(txn.parsedTxn.args[0].toString());
      data.to = txn.parsedTxn.args[1];
      tag = enums.TaskTag.mint;
      break;
    }
    case "transferFrom": {
      data.from = txn.parsedTxn.args[0];
      data.to = txn.parsedTxn.args[1];
      data.tokenId = parseInt(txn.parsedTxn.args[2].toString());
      tag = enums.TaskTag.transfer;
    }
  }

  // track only required eventIds
  if (task.eventIds?.size) {
    if (data.eventId && !task.eventIds.has(data.eventId)) return;
    else if (data.eventIds?.length && !data.eventIds.filter((eventId) => task.eventIds.has(eventId))?.length) return;
  }

  dataPublisher.pushData({ task, txn, data, taskType: enumsComplex.EventTypes.PoapEvent.name, tag });
};

module.exports = { processPoap };
