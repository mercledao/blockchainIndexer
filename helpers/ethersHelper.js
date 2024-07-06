const { ethers } = require("ethers");
const { abi, rpc, misc, dateMillis } = require("../constants");
const cacheHelper = require("./cacheHelper");
const utils = require("./utils");
const fetch = require("node-fetch");

const init = () => {
  _initProviderPool();
};

const _initProviderPool = () => {
  const supportedChains = Object.keys(rpc);
  supportedChains.forEach((chainId) => {
    cacheHelper.providersPool[chainId] = rpc[chainId].json().map((rpcUrl) => {
      // normal JsonRpcProvider makes eth_chainId call each time we make a request which is not necessary
      // https://github.com/ethers-io/ethers.js/issues/901#:~:text=Use%20StaticJsonRpcProvider%20or%20InfuraProvider,to%20avoid%20eth_ChainId%20calls
      const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
      // disable polling as we are manually polling
      provider.polling = false;
      return provider;
    });
    cacheHelper.providersPoolIndex[chainId] = 0;
  });

  const wallet = ethers.Wallet.createRandom();
  supportedChains.forEach((chainId) => {
    cacheHelper.voidSignersPool[chainId] = cacheHelper.providersPool[chainId].map(
      (provider) => new ethers.VoidSigner(wallet.address, provider)
    );
  });

  // zool testnet wallet
  cacheHelper.zooltestnet.wallet = new ethers.Wallet(
    process.env.INDEXER_WALLET_PRIV_KEY,
    new ethers.providers.StaticJsonRpcProvider("https://testnet.timesnap.xyz:8449")
  );
};

/**
 * will return @null if data doesn't exist
 */
const getBlockReceipts = async (chainId, blockNumber) => {
  const data = await (
    await fetch(rpc[chainId].json()[0], {
      method: "POST",
      "content-type": "application/json",
      body: JSON.stringify({
        method: "eth_getBlockReceipts",
        params: [`0x${BigInt(blockNumber).toString("16")}`],
        id: 1,
        jsonrpc: "2.0",
      }),
    })
  ).json();

  return data?.result;
};

const getBlockTransactionsWithoutChecksum = async (chainId, blockNumber) => {
  const data = await (
    await fetch(rpc[chainId].json()[0], {
      method: "POST",
      "content-Type": "application/json",
      body: JSON.stringify({
        method: "eth_getBlockByNumber",
        params: [`0x${BigInt(blockNumber).toString("16")}`, true],
        id: 1,
        jsonrpc: "2.0"
      }),
    })
  ).json();

  return data?.result?.transactions || [];
};

const getBlockNumber = async (chainId) => {
  const data = await (
    await fetch(rpc[chainId].json()[0], {
      method: "POST",
      "content-Type": "application/json",
      body: JSON.stringify({
        method: "eth_blockNumber",
        params: [],
        id: 1,
        jsonrpc: "2.0"
      }),
    })
  ).json();

  return data?.result || undefined;
};

const getBlockTransactions = async (chainId, blockNumber) => {
  return (await getProvider(chainId).getBlockWithTransactions(blockNumber))?.transactions || [];
};

const getProvider = (chainId) => {
  let index = cacheHelper.providersPoolIndex[chainId];
  const pool = cacheHelper.providersPool[chainId];

  if (index > pool.length) index = 0;
  cacheHelper.providersPoolIndex[chainId] = index;
  index++;

  return pool[index % pool.length];
};

const tryGetTransaction = async (chainId, txnHash) => {
  if (!txnHash) return;
  try {
    return await getProvider(chainId).getTransaction(txnHash);
  } catch (e) {
    console.error("could not get txn hash: ", chainId, txnHash, e);
  }
};

const tryGetReceipt = async (chainId, txnHash) => {
  if (!txnHash) return;
  try {
    return await getProvider(chainId).getTransactionReceipt(txnHash);
  } catch (e) {
    console.error("could not get txn receipt: ", chainId, txnHash, e)
  }
}

const getVoidSigner = (chainId) => {
  let index = cacheHelper.providersPoolIndex[chainId];
  const pool = cacheHelper.voidSignersPool[chainId];
  return pool[index % pool.length];
};

const getDecimals = async (tokenAddress, chainId) => {
  if (
    tokenAddress == ethers.constants.AddressZero ||
    tokenAddress == misc.ETH ||
    tokenAddress == misc.gasToken[chainId]?.daiAddress
  )
    return 18;

  const cacheKey = utils.hashObject({ tokenAddress, chainId, func: "getDecimals" });
  const cached = await cacheHelper.getDataJson(cacheKey);
  if (cached) return cached;

  const provider = getProvider(chainId);
  const erc20 = new ethers.Contract(tokenAddress, abi.erc20Abi, provider);
  const decimal = await erc20.decimals();

  cacheHelper.setDataJson(cacheKey, decimal);

  return decimal;
};

const getSymbol = async (tokenAddress, chainId) => {
  const cacheKey = utils.hashObject({ chainId, tokenAddress, func: "ethersHelper::getSymbol" });
  const cached = await cacheHelper.getDataJson(cacheKey);
  if (cached) return cached;

  const symbol = (await new ethers.Contract(tokenAddress, abi.erc20Abi, getProvider(chainId)).symbol()).trim();

  cacheHelper.setDataJson(cacheKey, symbol, dateMillis.week_1 * 2);

  return symbol;
};

const getTxnReceipt = async (chainId, txnHash) => {
  try {
    const data = await (
      await fetch(rpc[chainId].json()[0], {
        method: "POST",
        "content-Type": "application/json",
        body: JSON.stringify({
          method: "eth_getTransactionReceipt",
          params: [`${txnHash}`],
          id: 1,
          jsonrpc: "2.0"
        }),
      })
    ).json();
  
    return data?.result || undefined;
  } catch (e) {
    console.error("could not get receipt: ", e);
  }
}

module.exports = {
  init,
  getProvider,
  getBlockReceipts,
  getBlockTransactions,
  tryGetReceipt,
  tryGetTransaction,
  getVoidSigner,
  getDecimals,
  getSymbol,
  getBlockTransactionsWithoutChecksum,
  getBlockNumber,
  getTxnReceipt
};
