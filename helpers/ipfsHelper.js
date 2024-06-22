const { api } = require("../constants");
const { get } = require("./network");

const getJson = async (ipfsCid, ipfsResolver = api.ipfs.cloudflare) => {
  // todo: handle redis cache
  return await get(ipfsResolver(ipfsCid));
};

module.exports = { getJson };
