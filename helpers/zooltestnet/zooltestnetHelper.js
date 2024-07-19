const RdlAbi = require('../../abi/zooltestnet/RDL.json');
const cacheHelper = require('../cacheHelper');
const { ethers } = require('ethers');

let rdl;

const _getTag = (...params) => {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(params.join('_')));
};

const _splitArrayIntoChunks = (array, maxLength) => {
    let result = [];
    for (let i = 0; i < array.length; i += maxLength) {
        let chunk = array.slice(i, i + maxLength);
        result.push(chunk);
    }
    return result;
};

const indexDataBatch = async (txns) => {
    try {
        if (!rdl)
            // rdl = new ethers.Contract("0xC7d020495D692c8a66d8C0089616123939F8eAdf", RdlAbi, cacheHelper.zooltestnet.wallet); // v1
            // rdl = new ethers.Contract("0x1f733F45E52151AD213bc2DffA9d353278CAA1e8", RdlAbi, cacheHelper.zooltestnet.wallet); // v2
            rdl = new ethers.Contract(
                '0xC98AE786cAB90E2F6C8E39D13af19193931f40FF',
                RdlAbi,
                cacheHelper.zooltestnet.wallet,
            );

        const formatted = txns.map((txn) => {
            return {
                chainId: txn.chainId,
                txnHash: txn.hash,
                from: txn.realFrom || txn.from,
                to: txn.to,
                value: ethers.utils.parseUnits(parseFloat(txn.value.toString()).toFixed(6), 6),
                amountUsd: ethers.utils.parseUnits(
                    parseFloat(txn.amountUsd.toString()).toFixed(6),
                    6,
                ),
                tags: [_getTag(txn.abi, txn.tag)],
            };
        });

        const chunks = _splitArrayIntoChunks(formatted, 120); // this depends on the type of data being stored
        for (let i = 0; i < chunks.length; i++) {
            const txn = await rdl.indexDataBatch(chunks[i]);
            await txn.wait();
        }
    } catch (e) {
        console.error(e);
    }
};

module.exports = { indexDataBatch };
