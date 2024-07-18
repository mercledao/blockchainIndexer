const ZeroAddress = '0x0000000000000000000000000000000000000000';

const dateMillis = {
    sec_1: 1000,
    min_1: 60 * 1000,
    hour_1: 60 * 60 * 1000,
    day_1: 24 * 60 * 60 * 1000,
    week_1: 7 * 24 * 60 * 60 * 1000,
    month_1: 30 * 24 * 60 * 60 * 1000,
    year_1: 365 * 24 * 60 * 60 * 1000,
};

const rpc = {
    1: {
        json: () => [
            `https://winter-patient-tree.quiknode.pro/2d7a9effe19bc2e27d0bd56735f3c7fb5cc0882e`,
        ],
        pollRate: 15000,
        consumeRate: 10000,
    },
    10: {
        json: () => [
            `https://wider-light-sea.optimism.quiknode.pro/f3f07ca6955a0c1242a31dee2d0db257c0faccef`,
        ],
        pollRate: 3000,
        consumeRate: 2000,
    },
    56: {
        json: () => [
            'https://warmhearted-quaint-voice.bsc.quiknode.pro/5a84315fdc19ac92f18bae6c54dd75814ca834ad',
        ],
        pollRate: 3000,
        consumeRate: 2000,
    },
    100: {
        json: () => [
            'https://morning-rough-tent.xdai.quiknode.pro/664fd2accff946c2c65c92bc27c0028b70d97a32',
        ],
        pollRate: 3000,
        consumeRate: 2000,
    },
    137: {
        json: () => [
            `https://blue-weathered-wave.matic.quiknode.pro/e1f0ff2ed8994e76e6083e48e2dcb56a9d6e121f`,
        ],
        pollRate: 4000,
        consumeRate: 3000,
    },
    169: {
        json: () => [`https://pacific-rpc.manta.network/http`],
        pollRate: 10000,
        consumeRate: 7000,
        geth: true,
    },
    250: {
        json: () => [
            `https://fittest-black-emerald.fantom.quiknode.pro/fa918ecbb603be9341088c185e715d7318bfd36a`,
        ],
        pollRate: 4000,
        consumeRate: 3000,
    },
    324: {
        json: () => [
            `https://white-fittest-sheet.zksync-mainnet.quiknode.pro/9a83f61d4b5fb681cb70a74659fe7a06a3b5efcf`,
        ],
        pollRate: 4000,
        consumeRate: 3000,
    },
    1101: {
        json: () => [
            `https://delicate-still-slug.zkevm-mainnet.quiknode.pro/204fd90cfb58bffe6a0f9fc28c1d7372203e4a76`,
        ],
        pollRate: 4000,
        consumeRate: 3000,
    },
    59144: {
        json: () => [
            `https://linea.blockpi.network/v1/rpc/14dd99345edce68a9dceca2451447510f1d96946`,
        ],
        pollRate: 4000,
        consumeRate: 3000,
        geth: true,
    },
    8453: {
        json: () => [
            `https://light-still-tent.base-mainnet.quiknode.pro/fa1239dd03b84dfa5b44085138afb271fecab7ee`,
        ],
        pollRate: 1000,
        consumeRate: 2000,
    },
    42161: {
        json: () => [
            `https://distinguished-light-bird.arbitrum-mainnet.quiknode.pro/c8906c405c70519e87322d075d14044cb358b6fe`,
        ],
        pollRate: 500,
        consumeRate: 150,
    },
    43114: {
        json: () => [
            `https://little-virulent-sun.avalanche-mainnet.quiknode.pro/7621d06631db7e3da7e3aed8ec6ee571a6c503dc/ext/bc/C/rpc`,
        ],
        pollRate: 2000,
        consumeRate: 750,
    },
    80085: {
        json: () => [
            `https://purple-dimensional-glitter.bera-artio.quiknode.pro/67b0f331af3d77ac85c3e3065cf7ae8aa7e51a3a`,
        ],
        pollRate: 2000,
        consumeRate: 750,
    },
    534352: {
        json: () => [
            `https://nameless-boldest-diagram.scroll-mainnet.quiknode.pro/e530d1e48139ec4ba32532b4812dfc2fbe15ecfb`,
        ],
        pollRate: 6000,
        consumeRate: 3000,
        geth: true,
    },

    // arbitrum testnet sepolia. no need to add usd etc as we don't need token price
    // 421614: {
    //   json: () => [`https://arb-sepolia.g.alchemy.com/v2/wzqsgMUJVVnrzEAOpl_LIsXtZhZeyyut`],
    //   pollRate: 500,
    //   consumeRate: 150,
    // },
};

const abi = {
    erc20Abi: require('./abi/Erc20Abi.json'),
};

const id = {
    redis: {
        txnQueue: 'newBlockTxnQueue',
        txnQueueItem: (txn) => `newBlockTxnQueue:${txn.chainId}:${txn.hash}`,
        blocksQueue: (chainId) => `blocksQueue_${chainId}`,
        processedBlocksQueue: 'doneBlocksQueue',
        processedBlocksQueueItem: (chainId, blockNumber) =>
            `doneBlocksQueue:${chainId}:${blockNumber}`,
    },
};

const psql = {
    tables: {
        txn: (chainId) => ({
            name: `txn_${parseInt(chainId)}`,
            columns: {
                blockNumber: { field: 'block_number', as: 'blockNumber' },
                fromAddr: { field: 'from_addr', as: 'fromAddr' },
                gas: { field: 'gas', as: 'gas' },
                gasPrice: { field: 'gas_price', as: 'gasPrice' },
                maxFeePerGas: { field: 'max_fee_per_gas', as: 'maxFeePerGas' },
                maxPriorityFeePerGas: {
                    field: 'max_priority_fee_per_gas',
                    as: 'maxPriorityFeePerGas',
                },
                txnHash: { field: 'txn_hash', as: 'txnHash' },
                input: { field: 'input', as: 'input' },
                nonce: { field: 'nonce', as: 'nonce' },
                toAddr: { field: 'to_addr', as: 'toAddr' },
                value: { field: 'value', as: 'value' },
                type: { field: 'type', as: 'type' },
                chainId: { field: 'chain_id', as: 'chainId' },
                receiptContractAddress: {
                    field: 'receipt_contract_address',
                    as: 'receiptContractAddress',
                },
                receiptCumulativeGasUsed: {
                    field: 'receipt_cumulative_gas_used',
                    as: 'receiptCumulativeGasUsed',
                },
                receiptEffectiveGasPrice: {
                    field: 'receipt_effective_gas_price',
                    as: 'receiptEffectiveGasPrice',
                },
                receiptGasUsed: { field: 'receipt_gas_used', as: 'receiptGasUsed' },
                receiptLogsBloom: { field: 'receipt_logs_bloom', as: 'receiptLogsBloom' },
                methodId: { field: 'method_id', as: 'methodId' },
                timestamp: { field: 'timestamp', as: 'timestamp' },
            },
        }),
        logs: (chainId) => ({
            name: `logs_${parseInt(chainId)}`,
            columns: {
                txnHash: { field: 'txn_hash', as: 'txnHash' },
                contractAddr: { field: 'contract_addr', as: 'contractAddr' },
                topics: { field: 'topics', as: 'topics' },
                data: { field: 'data', as: 'data' },
                logIndex: { field: 'log_index', as: 'logIndex' },
            },
        }),
        indexer_constants: {
            name: 'indexer_constants',
            columns: {
                constants: { field: 'constants', as: 'constants' },
            },
        },
        tasks: {
            name: 'tasks',
            columns: {
                indexerId: { field: 'indexer_id', as: 'indexerId' },
                taskId: { field: 'task_id', as: 'taskId' },
                contractAddr: { field: 'contract_addr', as: 'contractAddr' },
                abiName: { field: 'abi_name', as: 'abiName' },
                type: { field: 'type', as: 'type' },
                chainId: { field: 'chain_id', as: 'chainId' },
                abi: { field: 'abi', as: 'abi' },
                track: { field: 'track', as: 'track' },
                integrators: { field: 'integrators', as: 'integrators' },
                filterParams: { field: 'filterparams', as: 'filterParams' },
                webhook: { field: 'webhook', as: 'webhook', type: 'jsonb' },
            },
        },
    },
    txn: {
      name: "txn",
      columns: {
        blockNumber: {field: "block_number", as: "blockNumber"},
        fromAddr: {field: "from_addr", as: "fromAddr"},
        gas: {field: "gas", as: "gas"},
        gasPrice: {field: "gas_price", as: "gasPrice"},
        maxFeePerGas: {field: "max_fee_per_gas", as: "maxFeePerGas"},
        maxPriorityFeePerGas: {field: "max_priority_fee_per_gas", as: "maxPriorityFeePerGas"},
        txnHash: { field: "txn_hash", as: "txnHash" },
        input: {field: "input", as: "input"},
        nonce: {field: "nonce", as: "nonce"},
        toAddr: {field: "to_addr", as: "toAddr"},
        value: {field: "value", as: "value"},
        type: {field: "type", as: "type"},
        chainId: {field: "chain_id", as: "chainId"},
        receiptContractAddress: {field: "receipt_contract_address", as: "receiptContractAddress"},
        receiptCumulativeGasUsed: {field: "receipt_cumulative_gas_used", as: "receiptCumulativeGasUsed"},
        receiptEffectiveGasPrice: {field: "receipt_effective_gas_price", as: "receiptEffectiveGasPrice"},
        receiptGasUsed: {field: "receipt_gas_used", as: "receiptGasUsed"},
        receiptLogsBloom: {field: "receipt_logs_bloom", as: "receiptLogsBloom"},
        methodId: {field: "method_id", as: "methodId"},
        timestamp: {field: "timestamp", as: "timestamp"},
      }, 
    },
    logs: {
      name: "logs",
      columns: {
        txnHash: { field: "txn_hash", as: "txnHash" },
        fromAddr: { field: "from_addr", as: "fromAddr" },
        contractAddr: {field: "contract_addr", as: "contractAddr"},
        topics: {field: "topics", as: "topics"},
        data: {field: "data", as: "data"},
        logIndex: {field: "log_index", as: "logIndex"},
      }
    },
    indexer_constants: {
      name: "indexer_constants",
      columns: {
        constants: {field: "constants", as: "constants"},
      }
    },
    tasks: {
      name: "tasks",
      columns: {
        indexerId: {field: "indexer_id", as: "indexerId"},
        taskId: {field: "task_id", as: "taskId"},
        contractAddr: {field: "contract_addr", as: "contractAddr"},
        abiName: {field: "abi_name", as: "abiName"},
        type: {field: "type", as: "type"},
        chainId: {field: "chain_id", as: "chainId"},
        abi: {field: "abi", as: "abi"},
        track: {field: "track", as: "track"},
        integrators: {field: "integrators", as: "integrators"},
        filterParams: {field: "filterparams", as: "filterParams"},
        webhook: {field: "webhook", as: "webhook", type: "jsonb"},
      }
    }
};

module.exports = {
    ZeroAddress,
    rpc,
    abi,
    dateMillis,
    psql,
    id,
};
