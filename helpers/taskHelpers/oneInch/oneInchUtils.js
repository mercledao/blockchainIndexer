const taskUtils = require("../taskUtils");

const parseLogsForTransfers = ({ txn }) => {
  return taskUtils.parseLogsForTransfers({ logs: txn.receipt.logs });
};

const findAffiliate = ({ task, txn }) => {
  const transfers = parseLogsForTransfers({ txn });
  const affiliateTransfer = transfers.find((transfer) => task.integrators?.has(transfer.to.toLowerCase()));
  return affiliateTransfer;
};

module.exports = { findAffiliate };
