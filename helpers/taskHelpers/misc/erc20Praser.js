const { ethers } = require("ethers");
const { enums } = require("../../../constants");
const ethersHelper = require("../../ethersHelper");

const parseTransfer = async ({ event, chainId }) => {
  const args = event.args;

  const decimals = await ethersHelper.getDecimals(event.address, chainId);

  const data = {
    type: enums.TaskTag.event,
    name: event.event,
    tag: enums.TaskTag.transfer,
    from: args[0],
    to: args[1],
    token: event.address,
    amount: parseFloat(ethers.utils.formatUnits(args[2], decimals)),
  };

  const txn = {
    hash: event.transactionHash,
    blockNumber: event.blockNumber,
    parsedTxn: { name: `event:Transfer` },
    from: args[0],
    to: args[1],
    chainId,
    value: "0",
  };

  if (data.from == ethers.constants.AddressZero) {
    data.realFrom = event.address; // contract address
  }

  return { txn, data };
};

const Transfer = async ({ events, chainId }) => {
  const txns = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    txns.push(await parseTransfer({ event, chainId }));
  }

  return txns;
};

module.exports = { Transfer };
