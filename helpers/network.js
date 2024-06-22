const fetch = require("node-fetch");

const get = async (url) => {
  return await (
    await fetch(url, {
      accept: "application/json",
    })
  ).json();
};

const getPriceIndexer = async (url) => {
  return await (
    await fetch(url, {
      accept: "application/json",
      headers:{
        'auth':process.env.INDEXER_API_ACCESS_KEY
      }
    })
  ).json();
};

const getZeroX = async (url) => {
  return await (
    await fetch(url, {
      accept: "application/json",
      headers: {
        "0x-api-key": process.env.ZERO_X_API_KEY,
      },
    })
  ).json();
};

/**
 * @param {requestConfig} config used to configure fetch api such as headers
 * @param {contractDetails} config used to configure fetch api such as communityId in body
 */
const post = async (url, body, requestConfig, eventTaskConfig) => {
  const config = { method: "POST" };

  config.headers = {
    accept: "*/*",
    "content-type": "application/json",
    ...(requestConfig?.headers || {}),
    ...(eventTaskConfig?.headers || {}),
  };
  config.body = JSON.stringify({ data: body, ...(requestConfig?.body || {}), ...(eventTaskConfig?.body || {}) });

  const response = await fetch(url, config);
  if (!response.ok) throw response;
};

module.exports = { get, getZeroX, post , getPriceIndexer };
