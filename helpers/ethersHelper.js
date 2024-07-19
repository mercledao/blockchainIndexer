const { ethers } = require('ethers');
const { rpc } = require('../constants');
const cacheHelper = require('./cacheHelper');
const { postRaw } = require('./network');

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
            (provider) => new ethers.VoidSigner(wallet.address, provider),
        );
    });

    // zool testnet wallet
    cacheHelper.zooltestnet.wallet = new ethers.Wallet(
        process.env.INDEXER_WALLET_PRIV_KEY,
        new ethers.providers.StaticJsonRpcProvider('https://testnet.timesnap.xyz:8449'),
    );
};

const getProvider = (chainId) => {
    let index = cacheHelper.providersPoolIndex[chainId];
    const pool = cacheHelper.providersPool[chainId];

    if (index > pool.length) index = 0;
    cacheHelper.providersPoolIndex[chainId] = index;
    index++;

    return pool[index % pool.length];
};

const getVoidSigner = (chainId) => {
    let index = cacheHelper.providersPoolIndex[chainId];
    const pool = cacheHelper.voidSignersPool[chainId];
    return pool[index % pool.length];
};

/**
 * will return @null if data doesn't exist
 */
const getBlockReceipts = async (chainId, blockNumber) => {
    const data = await postRaw(_getRpc(chainId), {
        method: 'eth_getBlockReceipts',
        params: [`0x${BigInt(blockNumber).toString('16')}`],
        id: 1,
        jsonrpc: '2.0',
    });

    return data?.result;
};

const getBlockTransactions = async (chainId, blockNumber) => {
    const data = await postRaw(_getRpc(chainId), {
        method: 'eth_getBlockByNumber',
        params: [`0x${parseInt(blockNumber).toString('16')}`, true],
        id: 1,
        jsonrpc: '2.0',
    });

    return {
        txns: data?.result?.transactions || [],
        timestamp: data?.result?.timestamp,
    };
};

const getBlockNumber = async (chainId) => {
    const data = await postRaw(_getRpc(chainId), {
        method: 'eth_blockNumber',
        params: [],
        id: 1,
        jsonrpc: '2.0',
    });

    return data?.result || undefined;
};

const getTxnReceipt = async (chainId, txnHash) => {
    try {
        const data = await postRaw(_getRpc(chainId), {
            method: 'eth_getTransactionReceipt',
            params: [`${txnHash}`],
            id: 1,
            jsonrpc: '2.0',
        });

        return data?.result || undefined;
    } catch (e) {
        console.error('could not get receipt: ', e);
    }
};

const getTxnByHash = async (chainId, txnHash) => {
    try {
        const data = await postRaw(_getRpc(chainId), {
            method: 'eth_getTransactionByHash',
            params: [`${txnHash}`],
            id: 1,
            jsonrpc: '2.0',
        });

        return data?.result || undefined;
    } catch (e) {
        console.error('could not get txn: ', e);
    }
};

// todo: round robbin between the rpcs
const _getRpc = (chainId) => rpc[chainId].json()[0];

module.exports = {
    init,
    getProvider,
    getVoidSigner,
    getBlockReceipts,
    getBlockTransactions,
    getBlockNumber,
    getTxnReceipt,
    getTxnByHash,
};
