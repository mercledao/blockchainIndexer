const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const swapExactETHForTokens = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const paymasterConfig = {
    topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    paymasterAddressBytes: "0x000000000000000000000000abca8cfdfa2a4285a4704bf960fb45e49821762f",
    paymasterAddressV2Bytes: "0x00000000000000000000000040ad8e452b87381adb6c088fb80173b80752ed65",
  };

  const data = {
    // amountEth: txn.value.toString(),
    // amountOutMin: txnArgs[0].toString(),
    // path: txnArgs[1],
    to: txnArgs[2],
    // deadline: txnArgs[3].toString(),
  };

  const logs = txn.receipt.logs;
  const hasPaymaster = logs.find(
    (l) =>
      l?.topics?.[0] == paymasterConfig.topic &&
      (l?.topics?.[2] == paymasterConfig.paymasterAddressBytes ||
        l?.topics?.[2] == paymasterConfig.paymasterAddressV2Bytes)
  );

  const tokenUsd = await tokenPriceHelper.getTradeUsdTry(txn, misc.ETH, txn.value.toString(), 0);
  // data.tokenUsd = tokenUsd.tokenUsd;
  data.tokenValue = tokenUsd.tokenValue;
  data.amountUsd = data.tokenValue;

  data.realFrom = data.to;
  data.tag = hasPaymaster ? enums.TaskTag.paymaster : enums.TaskTag.swap;

  return data;
};

module.exports = {
  swapExactETHForTokens,
};
