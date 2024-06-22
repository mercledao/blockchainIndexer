const { ethers } = require("ethers");
const { misc, enums } = require("../../../constants");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");

/**
 * this is for ETH token only
 */
const _getTxnPayload = async ({ owner, event, chainId, contract, name }) => {
  const data = { owner };
  data.currentBalance = (await contract.balanceOf(data.owner)).toString();
  data.token = contract.address;
  data.chainId = parseInt(chainId);
  data.blockNumber = event.blockNumber;

  const txn = {
    hash: event.transactionHash,
    blockNumber: event.blockNumber,
    parsedTxn: { name },
    from: owner,
    to: contract.address,
    chainId,
    value: "0",
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(
    { chainId: 1, hash: txn.hash },
    misc.ETH,
    data.currentBalance,
    0
  );
  data.tokenPrice = tokenUsd.tokenUsd;
  data.tokenValue = tokenUsd.tokenValue;
  data.tag = name;

  return { txn, data };
};

const _parseTransfer = async ({ event, chainId, contract }) => {
  return [];
};

const _process = async ({ events, chainId, contract, parser }) => {
  const txns = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const args = event.args;
    const from = args[0] == ethers.constants.AddressZero ? undefined : args[0];
    const to = args[1] == ethers.constants.AddressZero ? undefined : args[1];

    if (from)
      txns.push(await _getTxnPayload({ owner: from, event, chainId, contract, name: enums.TaskTag.balanceChange }));
    if (to) txns.push(await _getTxnPayload({ owner: to, event, chainId, contract, name: enums.TaskTag.balanceChange }));
  }

  return txns;
};

const Transfer = async ({ events, chainId, contract }) => {
  return await _process({ events, chainId, contract });
};

module.exports = { Transfer };
