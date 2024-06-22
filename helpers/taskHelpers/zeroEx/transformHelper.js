const AffiliateFeeTransformerAbi = require("../../../abi/zeroEx/transformers/AffiliateFeeTransformer.json");
const FillQuoteTransformerAbi = require("../../../abi/zeroEx/transformers/FillQuoteTransformer.json");
const PayTakerTransformerAbi = require("../../../abi/zeroEx/transformers/PayTakerTransformer.json");
const PositiveSlippageFeeTransformerAbi = require("../../../abi/zeroEx/transformers/PositiveSlippageFeeTransformer.json");
const WethTransformerAbi = require("../../../abi/zeroEx/transformers/WethTransformer.json");

const parseFillQuoteTransformer = (args) => {
  return {
    parser: this.name,
    side: args[0][0].toString(),
    sellToken: args[0][1],
    buyToken: args[0][2],
    bridgeOrders: args[0][3].map((order) => ({
      source: order[0],
      takerTokenAmount: order[1].toString(),
      makerTokenAmount: order[2].toString(),
      bridgeData: order[3],
    })),
    limitOrders: args[0][4].map((limitOrder) => ({
      order: {
        makerToken: limitOrder[0][0],
        takerToken: limitOrder[0][1],
        makerAmount: limitOrder[0][2].toString(),
        takerAmount: limitOrder[0][3].toString(),
        takerTokenFeeAmount: limitOrder[0][4].toString(),
        maker: limitOrder[0][5],
        taker: limitOrder[0][6],
        sender: limitOrder[0][7],
        feeRecipient: limitOrder[0][8],
        pool: limitOrder[0][9],
        expiry: limitOrder[0][10].toString(),
        salt: limitOrder[0][11].toString(),
      },
      signature: {
        signatureType: limitOrder[1][0],
        v: limitOrder[1][1],
        r: limitOrder[1][2],
        s: limitOrder[1][3],
      },
      maxTakerTokenFillAmount: limitOrder[2].toString(),
    })),
    rfqOrders: args[0][5].map((rfqOrder) => ({
      order: {
        makerToken: rfqOrder[0][0],
        takerToken: rfqOrder[0][1],
        makerAmount: rfqOrder[0][2].toString(),
        takerAmount: rfqOrder[0][3].toString(),
        maker: rfqOrder[0][4],
        taker: rfqOrder[0][5],
        txOrigin: rfqOrder[0][6],
        pool: rfqOrder[0][7],
        expiry: rfqOrder[0][8].toString(),
        salt: rfqOrder[0][9].toString(),
      },
      signature: {
        signatureType: rfqOrder[1][0],
        v: rfqOrder[1][1],
        r: rfqOrder[1][2],
        s: rfqOrder[1][3],
      },
      maxTakerTokenFillAmount: rfqOrder[2].toString(),
    })),
    fillSequence: args[0][6].map((v) => v.toString()),
    fillAmount: args[0][7].toString(),
    refundReceiver: args[0][8],
    otcOrders: args[0][9].map((otcOrder) => ({
      order: {
        makerToken: otcOrder[0][0],
        takerToken: otcOrder[0][1],
        makerAmount: otcOrder[0][2].toString(),
        takerAmount: otcOrder[0][3].toString(),
        maker: otcOrder[0][4],
        taker: otcOrder[0][5],
        txOrigin: otcOrder[0][6],
        expiryAndNonce: otcOrder[0][7].toString(),
      },
      signature: {
        signatureType: otcOrder[1][0],
        v: otcOrder[1][1],
        r: otcOrder[1][2],
        s: otcOrder[1][3],
      },
      maxTakerTokenFillAmount: otcOrder[2].toString(),
    })),
  };
};
const parsePayTakerTransformer = (args) => {
  return {
    tokens: args[0][0],
    amounts: args[0][1].map((v) => v.toString()),
  };
};
const parseAffiliateFeeTransformer = (args) => {
  return args[0].map((fee) => ({
    token: fee[0],
    amount: fee[1].toString(),
    recipient: fee[2],
  }));
};
const parsePositiveSlippageFeeTransformer = (args) => {
  return {
    token: args[0][0],
    bestCaseAmount: args[0][1].toString(),
    recipient: args[0][2],
  };
};
const parseWethTransformer = (args) => {
  return {
    token: args[0][0],
    amount: args[0][1].toString(),
  };
};

module.exports = {
  parseFillQuoteTransformer,
  parseAffiliateFeeTransformer,
  parsePayTakerTransformer,
  parsePositiveSlippageFeeTransformer,
  parseWethTransformer,
  transformParsers: [
    { abi: FillQuoteTransformerAbi, parse: parseFillQuoteTransformer },
    { abi: AffiliateFeeTransformerAbi, parse: parseAffiliateFeeTransformer },
    { abi: PayTakerTransformerAbi, parse: parsePayTakerTransformer },
    { abi: PositiveSlippageFeeTransformerAbi, parse: parsePositiveSlippageFeeTransformer },
    { abi: WethTransformerAbi, parse: parseWethTransformer },
  ],
  fallbackParser: { abi: FillQuoteTransformerAbi, parse: parseFillQuoteTransformer },
};
