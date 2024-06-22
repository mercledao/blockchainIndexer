const { ethers } = require("ethers");

const parseLogsForTransfers = ({ logs }) => {
  const topicTransfers = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  return logs
    .filter((log) => log.topics[0] == topicTransfers)
    .map((log) => ({
      from: ethers.utils.getAddress(ethers.utils.hexDataSlice(log.topics[1], 12)),
      to: ethers.utils.getAddress(ethers.utils.hexDataSlice(log.topics[2], 12)),
      value: ethers.BigNumber.from(log.data == "0x" ? "0" : log.data).toString(),
    }));
};

module.exports = {
  parseLogsForTransfers,
};
