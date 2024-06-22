const { ethers } = require("ethers");
const { transformParsers, fallbackParser } = require("./transformHelper");
const ethersHelper = require("../../ethersHelper");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");

// todo: no need to verify maker. its for their internal processing. not sure why maker sign is required though
// this is working for fillOtcOrderWithEth
const getSignerAddress = (txn, order, sign) => {
  // todo: handle for eth sign flow
  switch (sign.signatureType) {
    case 2: {
      // eip712
      return ethers.utils.verifyMessage(ethers.utils.arrayify(_getOrderHash(order, txn.chainId, txn.to)), {
        r: sign.r,
        s: sign.s,
        v: sign.v,
      });
    }
    case 3:
      // ethsign
      console.log("\n==================\n", `ethSign 0x protocol ${txn.hash}`, "\n==================\n");
    default: {
      return undefined;
    }
  }
};

const _getOrderHash = (order, chainId, verifyingContract) => {
  const domain = {
    name: "ZeroEx",
    version: "1.0.0",
    chainId,
    verifyingContract,
  };
  const types = {
    OtcOrder: [
      { name: "makerToken", type: "address" },
      { name: "takerToken", type: "address" },
      { name: "makerAmount", type: "uint128" },
      { name: "takerAmount", type: "uint128" },
      { name: "maker", type: "address" },
      { name: "taker", type: "address" },
      { name: "txOrigin", type: "address" },
      { name: "expiryAndNonce", type: "uint256" },
    ],
  };
  return ethers.utils._TypedDataEncoder.hash(domain, types, order);
};

const decodeTransformation = (data) => {
  for (let i = 0; i < transformParsers.length; i++) {
    try {
      const parser = transformParsers[i];
      const interface = new ethers.utils.Interface(parser.abi);

      const funSig = interface.getSighash("abiDecodeStruct");
      const fullData = `${funSig}${data.substring(2)}`;
      const dummyTxn = interface.parseTransaction({ data: fullData });

      /**
       * parseTransaction matches for subset of data bytes to function args so it results in false positives
       * recompute the data bytes and compare with original to see if its the required one
       */
      const recomputedData = interface.encodeFunctionData("abiDecodeStruct", dummyTxn.args);
      if (fullData != recomputedData) {
        continue;
      }

      return { parserName: parser.parse.name, data: parser.parse(dummyTxn.args) };
    } catch (e) {
      // no-op. parse failed so try next abi
      continue;
    }
  }

  // force try with parseFillQuoteTransformer
  try {
    const parser = fallbackParser;
    const interface = new ethers.utils.Interface(parser.abi);

    const funSig = interface.getSighash("abiDecodeStruct");
    const fullData = `${funSig}${data.substring(2)}`;
    const dummyTxn = interface.parseTransaction({ data: fullData });
    return { parserName: parser.parse.name, data: parser.parse(dummyTxn.args) };
  } catch (e) {
    console.error(e);
  }

  console.error("\n#### ZeroEx Transformer NOT FOUND ####\n", data, "\n###############################\n");
  return undefined;
};

module.exports = {
  decodeTransformation,
};
