const { enums } = require("../../constants");
const tokenPriceHelper = require("../tokenPrice/tokenPriceHelper");

module.exports = {
  "0x2170c741": {
    topic:
      "event Swap(bytes32 indexed poolId, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)",
    parser: async (txn, args, chainId) => {
      const data = {
        name: "Swap",
        tag: enums.TaskTag.swap,
        poolId: args[0],
        tokenIn: args[1],
        tokenOut: args[2],
        amountIn: args[3].toString(),
        amountOut: args[4].toString(),
      };

      const tokenInUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokenIn, data.amountIn, 0);
      data.tokenInUsd = tokenInUsd.tokenUsd;
      data.tokenInValue = tokenInUsd.tokenValue;
      data.amountInUsd = data.tokenInValue;

      const tokenOutUsd = await tokenPriceHelper.getTradeUsdTry(txn, data.tokenOut, data.amountOut, 0);
      data.tokenOutUsd = tokenOutUsd.tokenUsd;
      data.tokenOutValue = tokenOutUsd.tokenValue;
      data.amountOutUsd = data.tokenOutValue;

      data.amountUsd = Math.max(data.amountInUsd, data.amountOutUsd);

      return data;
    },
  },
};
