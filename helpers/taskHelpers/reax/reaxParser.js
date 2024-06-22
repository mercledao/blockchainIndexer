const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const noAbiHelper = require("../noAbiHelper");
const { enums, misc } = require("../../../constants");

const supply = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    asset: txnArgs[0],
    amount: txnArgs[1].toString(),
    onBehalfOf: txnArgs[2],
    // referralCode: parseInt(txnArgs[3]),
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.asset, data.amount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.lend;

  return data;
};

const supplyWithPermit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    asset: txnArgs[0][0],
    amount: txnArgs[0][1].toString(),
    onBehalfOf: txnArgs[0][2],
    // referralCode: parseInt(txnArgs[0][3].toString()),
    // deadline: txnArgs[0][4].toString(),
    // permitV: parseInt(txnArgs[0][5].toString()),
    // permitR: txnArgs[0][6],
    // permitS: txnArgs[0][7],
  };

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.asset, data.amount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;
  data.realFrom = data.onBehalfOf;

  data.tag = enums.TaskTag.lend;

  return data;
};

const aaveDepositETH = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // pool: txnArgs[0],
    onBehalfOf: txnArgs[1],
    // referralCode: parseInt(txnArgs[2].toString()),
  };
  data.realFrom = data.onBehalfOf;

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.WETH[txn.chainId], txn.value.toString(), 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;
  // data.ether = ethers.utils.formatEther(txn.value);

  data.tag = enums.TaskTag.lend;

  return data;
};

const joinPool = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    poolId: txnArgs[0],
    sender: txnArgs[1],
    recipient: txnArgs[2],
    request: {
      assets: txnArgs[3][0],
      maxAmountIn: txnArgs[3][1].map((v) => v.toString()),
      userData: txnArgs[3][2],
      fromInternalBalance: txnArgs[3][3],
    },
  };

  /**
   * userData depends upon the type of joinKind. so get the join kind, then switch between the required abi.
   * more details are here
   * https://github.com/balancer/docs/blob/bdc4cb4b3a1d0ac7b4b3282cc99d44b6014e0c76/docs/reference/joins-and-exits/pool-joins.md
   */
  const joinKind = parseInt(ethers.utils.defaultAbiCoder.decode(["uint256"], data.request.userData)[0].toString());
  data.request.joinKind = joinKind;

  switch (joinKind) {
    // Initial Join
    case 0: {
      // decode userData
      const abi = ["uint256", "uint256[]"];
      const userDataDecoded = ethers.utils.defaultAbiCoder.decode(abi, data.request.userData);
      data.request.userDataDecoded = {
        joinKind: userDataDecoded[0].toString(),
        amountsIn: userDataDecoded[1].map((v) => v.toString()),
      };
      // compute usd amount. not sure if getting 0th index is correct though
      const tokenUsd = await tokenPriceHelper.getTradeUsdTry(
        txn,
        data.request.assets[0],
        data.request.userDataDecoded.amountsIn[0],
        0
      );
      // data.tokenUsd = tokenUsd.tokenUsd;
      // data.tokenValue = tokenUsd.tokenValue;
      data.amountUsd = tokenUsd.tokenValue;
      break;
    }
    // Exact Tokens Join
    case 1: {
      // decode userData
      const abi = ["uint256", "uint256[]", "uint256"];
      const userDataDecoded = ethers.utils.defaultAbiCoder.decode(abi, data.request.userData);
      data.request.userDataDecoded = {
        joinKind: userDataDecoded[0].toString(),
        amountsIn: userDataDecoded[1].map((v) => v.toString()),
        minimumBPT: userDataDecoded[2].toString(),
      };
      // compute usd amount. not sure if getting 0th index is correct though
      const tokenUsd = await tokenPriceHelper.getTradeUsdTry(
        txn,
        data.request.assets[0],
        data.request.userDataDecoded.amountsIn[0],
        0
      );
      // data.tokenUsd = tokenUsd.tokenUsd;
      // data.tokenValue = tokenUsd.tokenValue;
      data.amountUsd = tokenUsd.tokenValue;
      break;
    }
    // Single Token Join
    case 2: {
      // decode userData
      const abi = ["uint256", "uint256", "uint256"];
      const userDataDecoded = ethers.utils.defaultAbiCoder.decode(abi, data.request.userData);
      data.request.userDataDecoded = {
        joinKind: userDataDecoded[0].toString(),
        bptAmountOut: userDataDecoded[1].toString(),
        enterTokenIndex: parseInt(userDataDecoded[2].toString()),
      };
      // compute usd amount.
      const tokenUsd = await tokenPriceHelper.getTradeUsdTry(
        txn,
        data.request.assets[data.request.userDataDecoded.enterTokenIndex],
        data.request.userDataDecoded.bptAmountOut,
        0
      );
      // data.tokenUsd = tokenUsd.tokenUsd;
      // data.tokenValue = tokenUsd.tokenValue;
      data.amountUsd = tokenUsd.tokenValue;
      break;
    }
    // Proportional Join
    case 3: {
      // decode userData
      const abi = ["uint256", "uint256"];
      const userDataDecoded = ethers.utils.defaultAbiCoder.decode(abi, data.request.userData);
      data.request.userDataDecoded = {
        joinKind: userDataDecoded[0].toString(),
        bptAmountOut: userDataDecoded[1].toString(),
      };
      // compute usd amount. not sure if getting 0th index is correct though
      const tokenUsd = await tokenPriceHelper.getTradeUsdTry(
        txn,
        data.request.assets[0],
        data.request.userDataDecoded.bptAmountOut,
        0
      );
      // data.tokenUsd = tokenUsd.tokenUsd;
      // data.tokenValue = tokenUsd.tokenValue;
      data.amountUsd = tokenUsd.tokenValue;
      break;
    }
  }

  data.tag = enums.TaskTag.lp;

  return data;
};

/**
 * this is for stake. no need for usdc amount atm so no need to parse bytes.
 * set amountUsd to 0 by default for now for consistency
 */
const multicall = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    // data: txnArgs[0],
    amountUsd: 0,
  };

  data.tag = enums.TaskTag.stake;

  return data;
};

// dont have abi or its a very generic proxy contract. just parse logs to know if it has swap
const noAbi = async ({ task, txn }) => {
  try {
    // parse log to get amountUsd individually
    const parsedLogs = [];
    const logs = txn.receipt.logs;
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const topic = log.topics[0];
      const topicId = topic.substring(0, 10); //0x = 2 char, 8 char event signature
      const abi = noAbiHelper[topicId];
      if (!abi) continue;

      const interface = new ethers.utils.Interface([abi.topic]);
      parsedLogs.push(await abi.parser(txn, interface.parseLog(log).args, txn.chainId));
    }

    if (!parsedLogs.length) return undefined;

    // finalize amountUsd data
    let amountUsd = 0;
    for (let i = 0; i < parsedLogs.length; i++) {
      amountUsd = Math.max(parsedLogs[i].amountUsd, amountUsd);
    }

    // final data payload
    const data = { parsedLogs, amountUsd };

    // todo: handle this is a better way. maybe handle for array of tags?
    data.tag = parsedLogs[0].tag;

    return data;
  } catch (e) {
    return undefined;
  }
};

// mint synth
const mint = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    synthIn: txnArgs[0],
    amountIn: txnArgs[1].toString(),
    // to: txnArgs[2],
    // pythUpdateData: txnArgs[3],
  };
  data.realFrom = txnArgs[2];

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.synthIn, data.amountIn, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.mint;

  return data;
};

/**
 * parser nested inside contract address because contracts have same function names
 */
module.exports = {
  // lend
  "0x5069736565cdBdff640328a59541C3854C331192": { supply, supplyWithPermit },
  "0x4bbea708F4e48eB0BB15E0041611d27c3c8638Cf": { supply, supplyWithPermit },
  "0x20127Cd9fD513c69962106b51b7996d73786BD6f": { depositETH: aaveDepositETH },
  "0xcD42a8B99239D4a806DF4E340f2373bABaDC6a72": { depositETH: aaveDepositETH },
  "0x9C31d48De0B5B47FF52F637c526687dd06CA8431": { depositETH: aaveDepositETH },
  // lp
  "0x1AA7f1f5b51fe22478e683466232B5C8fc49407f": { joinPool },
  // stake
  "0x6488d552b47F6BAa4c1Efd46CE740aAf6Ed4c2CC": { multicall },
  // swap
  "0xe1FFC470a1dAFDF9aFB6627Cc3816F35fE09D09E": { noAbi },
  // mint synth
  "0x78B2fa94A94bF3E96fcF9CE965bed55bE49FA9E7": { mint },
};
