const { ethers } = require("ethers");
const { abi } = require("../../../constants");
const { getProvider } = require("../../ethersHelper");

/**
 * @param {hexOnly} hexOnly Remove prepending 0x from hex string before passing. Eg, ffaabb
 */
const _decodeFirstPoolInfoFromPath = (hexOnly) => {
  /**
   * data is packed as 20 + 3 + 20 bytes meaning address + fee + address.
   * if its multihop then 3 + 20 continues i.e 20 + 3 + 20 + [3 + 20]
   * hops possible happens when there is no direct swap possible between two token
   *
   * here we are using 40 + 6 + 40 because 1bytes = 2 chars
   *
   * Reference for decoding pool
   * https://github.com/0xProject/protocol/blob/3c98225720ce9e1c87b59547f9be90e76ec834bb/contracts/zero-ex/contracts/src/features/UniswapV3Feature.sol#L333
   *
   *     // mload only loads 32bytes at a time which is 256 bits
   *     assembly {
   *         let p := add(encodedPath, 32)     // goto start of data. first 32 bytes is length of bytes
   *         inputToken := shr(96, mload(p))   // 256bit - 96bit = 160bit, 160bit / 8bit = 20bytes = address
   *         p := add(p, 20)                   // skip 20 bytes which is the address
   *         fee := shr(232, mload(p))         // 256 - 232 = 24, 24/8 = 3bytes = fee
   *         p := add(p, 3)                    // skip 3 bytes which is fee
   *         outputToken := shr(96, mload(p))  // 96bits = 20 bytes = address
   *     }
   *
   * eg
   * 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2002710b8c77482e45f1f44de1745f52c74426c631bdd52
   * c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 002710 b8c77482e45f1f44de1745f52c74426c631bdd52
   * 20bytes                                  3bytes 20bytes
   */
  const inputToken = hexOnly.substring(0, 40);
  const fee = hexOnly.substring(40, 46);
  const outputToken = hexOnly.substring(46, 86);
  const nextHopPath = hexOnly.substring(46);

  return {
    inputToken: ethers.utils.getAddress(`0x${inputToken}`),
    fee: ethers.BigNumber.from(`0x${fee}`).toString(),
    outputToken: ethers.utils.getAddress(`0x${outputToken}`),
    nextHopPath,
  };
};

/**
 *
 * @param {_encodedPath} encodedHopPath this has prepending 0x hex value. Eg, 0xffaabb
 *
 * Reference for next hop shift
 * https://github.com/0xProject/protocol/blob/3c98225720ce9e1c87b59547f9be90e76ec834bb/contracts/zero-ex/contracts/src/features/UniswapV3Feature.sol#L261C17-L261C28
 */
const decodeAllPoolInfoFromPath = (_encodedPath) => {
  const pools = [];
  let encodedPath = _encodedPath?.startsWith("0x") ? _encodedPath.substring(2) : _encodedPath;
  while (encodedPath?.length >= 86) {
    const { nextHopPath, ...poolData } = _decodeFirstPoolInfoFromPath(encodedPath);
    pools.push(poolData);
    encodedPath = nextHopPath;
  }
  return pools;
};

/**
 *
 * @param {*} tokenIndex can be 0 or 1 i.e token0 or token1
 * @returns
 */
const getTokenFromV3Pool = async (poolAddress, chainId, tokenIndex) => {
  const pool = new ethers.Contract(poolAddress, abi.uniswapV3PoolAbi, getProvider(chainId));
  const token = await pool[`token${tokenIndex}`]();
  return token;
};

module.exports = {
  decodeAllPoolInfoFromPath,
  getTokenFromV3Pool,
};
