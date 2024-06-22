const taskUtils = require("../taskUtils");

const getTransfers = ({ txn }) => {
  return taskUtils.parseLogsForTransfers({ logs: txn.receipt.logs });
};

module.exports = {
  getTransfers,
};
