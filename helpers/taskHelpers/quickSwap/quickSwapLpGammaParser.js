const { ethers } = require("ethers");
const HypervisorAbi = require("../../../abi/quickSwap/HypervisorAbi.json");
const ethersHelper = require("../../ethersHelper");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums } = require("../../../constants");

const deposit = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;
  const data = {
    deposit0: txnArgs[0].toString(),
    deposit1: txnArgs[1].toString(),
    to: txnArgs[2],
    from: txnArgs[3].toString(),
    minIn: txnArgs[4].map((v) => v.toString()),
  };

  const hypervisor = new ethers.Contract(data.from, HypervisorAbi, ethersHelper.getProvider(txn.chainId));
  data.token0 = await hypervisor.token0();
  data.token1 = await hypervisor.token1();

  data.token0Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.token0, data.deposit0, 0);
  data.token1Usd = await tokenPriceHelper.getTradeUsdTry(txn, data.token1, data.deposit1, 0);
  data.amountUsd = data.token0Usd.tokenValue + data.token1Usd.tokenValue;

  const finalData = {
    amountUsd: data.amountUsd,
    tag: enums.TaskTag.deposit,
  };
  return finalData;
};

module.exports = { deposit };
