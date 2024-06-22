const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums } = require("../../../constants");

const stake = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    amount: txnArgs[0].toString(),
    // duration: txnArgs[0].toString(),
    // rewardInterestRate: txnArgs[0].toString(),
    // _timestamp: txnArgs[0].toString(),
  };
  data.token = "0x30b593f8c3ab37615359B4E0E6df2e06d55bB55d";

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.token, data.amount, 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  // data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = tokenUsd.tokenValue;

  data.tag = enums.TaskTag.stake;

  return data;
};

const stakeEvent = {
  topic: "0xc8f30a591574435c94a09238c377906ce144a104b30fd1a7e81cdf2300b85759",
  abi: [
    "event ExecuteAddLiquidity(address indexed account, address token, uint256 amountIn, uint256 minUsdf, uint256 minFlp, uint256 acceptablePrice, uint256 executionFee, uint256 blockGap, uint256 timeGap)",
  ],
  parser: async (txn, args) => {
    const data = {
      name: "Stake",
      tag: enums.TaskTag.stake,
      // account: args[0],
      token: args[1],
      amountIn: args[2].toString(),
      // minUsdf: args[3].toString(),
      // minFlp: args[4].toString(),
      // acceptablePrice: args[4].toString(),
      // executionFee: args[4].toString(),
      // blockGap: args[4].toString(),
      // timeGap: args[4].toString(),
    };

    const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.token, data.amountIn, 0);
    // data.tokenUsd = tokenUsd.tokenUsd;
    // data.tokenValue = tokenUsd.tokenValue;
    data.amountUsd = tokenUsd.tokenValue;

    return data;
  },
};
const swapEvent = {
  topic: "0xa17359d2c3dad2ce9e367baecbe23f6edac661480739f25a46a74a65af9c7833",
  abi: [
    "event ExecuteSwap (address indexed account, address[] path, uint256 amountIn,uint256 amountOut, uint256 minOut, address receiver, uint256 acceptableRatio, uint256 executionFee, uint256 blockGap, uint256 timeGap)",
  ],
  parser: async (txn, args) => {
    const data = {
      name: "Swap",
      tag: enums.TaskTag.swap,
      // account: args[0],
      path: args[1],
      amountIn: args[2].toString(),
      // amountOut: args[3].toString(),
      // minOut: args[4].toString(),
      // receiver: args[5].toString(),
      // acceptableRatio: args[6].toString(),
      // executionFee: args[7].toString(),
      // blockGap: args[8].toString(),
      // timeGap: args[9].toString(),
    };

    const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.path[0], data.amountIn, 0);
    // data.tokenUsd = tokenUsd.tokenUsd;
    // data.tokenValue = tokenUsd.tokenValue;
    data.amountUsd = tokenUsd.tokenValue;

    return data;
  },
};
const longShortEvent = {
  topic: "0x1be316b94d38c07bd41cdb4913772d0a0a82802786a2f8b657b6e85dbcdfc641",
  abi: [
    "event ExecuteIncreasePosition (address indexed account, address[] path, address indexToken, uint256 amountIn, uint256 minOut, uint256 sizeDelta, bool isLong, uint256 acceptablePrice, uint256 executionFee, uint256 blockGap, uint256 timeGap)",
  ],
  parser: async (txn, args) => {
    const data = {
      // account: args[0],
      // path: args[1],
      indexToken: args[2].toString(),
      amountIn: args[3].toString(),
      // minOut: args[4].toString(),
      // sizeDelta: args[5].toString(),
      // isLong: args[6],
      // acceptablePrice: args[7].toString(),
      // executionFee: args[8].toString(),
      // blockGap: args[9].toString(),
      // timeGap: args[10].toString(),
    };
    if (data.isLong) {
      (data.name = "Long"), (data.tag = enums.TaskTag.long);
    } else {
      (data.name = "Short"), (data.tag = enums.TaskTag.short);
    }

    const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.indexToken, data.amountIn, 0);
    // data.tokenUsd = tokenUsd.tokenUsd;
    // data.tokenValue = tokenUsd.tokenValue;
    data.amountUsd = tokenUsd.tokenValue;

    return data;
  },
};

// all of the contract interactions happen from this function i.e swap, stake, long/short
const setPricesWithBitsAndExecute = async ({ txn }) => {
  const parsers = [stakeEvent, swapEvent, longShortEvent];

  const topics = {};
  txn.receipt.logs.forEach((log) => (topics[log.topics[0]] = log));

  for (let i = 0; i < parsers.length; i++) {
    const log = topics[parsers[i].topic];
    if (log) {
      const interface = new ethers.utils.Interface(parsers[i].abi);
      return await parsers[i].parser(txn, interface.parseLog(log).args);
    }
  }
};

module.exports = { setPricesWithBitsAndExecute, stake };
