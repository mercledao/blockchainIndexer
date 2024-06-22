const { ethers } = require("ethers");
const { enums } = require("../../../constants");

const Transfer = async ({ event }) => {
  const args = event.args;

  const data = {
    type: enums.TaskTag.event,
    name: event.event,
    tag: enums.TaskTag.transfer,
    from: args[0],
    to: args[1],
    tokenId: args[2].toString(),
  };

  const txn = {
    hash: event.transactionHash,
    blockNumber: event.blockNumber,
    from: data.from, // possibly zero address
    to: data.to, // recipient of the transfer
  };

  if (txn.from == ethers.constants.AddressZero) {
    data.realFrom = event.address; // contract address
  }

  return { txn, data };
};

module.exports = { Transfer };
