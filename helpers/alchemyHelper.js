const cacheHelper = require("./cacheHelper");
const utils = require("./utils");
const { get } = require("./network");
const { api, dateMillis } = require("../constants");

// this will throw if tokenId doesn't exist
const getTokenId = async (ownerAddress, tokenAddress, chainId) => {
  const cacheKey = utils.hashObject({ ownerAddress, tokenAddress, chainId, func: "getTokenId" });
  const cached = await cacheHelper.getDataJson(cacheKey);
  if (cached) return cached;

  const response = await get(api.alchemy.getNftTokenId(ownerAddress, tokenAddress, chainId));
  let maxTokenId = parseInt(response.ownedNfts[0].id.tokenId);
  for (let i = 0; i < response.ownedNfts.length; i++) {
    const tokenId = parseInt(response.ownedNfts[i].id.tokenId);
    if (maxTokenId < tokenId) maxTokenId = tokenId;
  }

  cacheHelper.setDataJson(cacheKey, maxTokenId, dateMillis.day_1);

  return maxTokenId;
};

module.exports = { getTokenId };
