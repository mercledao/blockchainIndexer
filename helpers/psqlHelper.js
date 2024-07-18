const { Client } = require("pg");
const { psql, rpc } = require("../constants");
const constants = require("../constants");
const { config } = require("./data/tasks.json");

const client = new Client();

const _initTokenBackTable = async () => {
  const tableDetails = psql.tables.tokenBack;
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${tableDetails.name} (
      ${tableDetails.columns.txnHash.field} TEXT NOT NULL,
      ${tableDetails.columns.blockId.field} BIGINT NOT NULL, 
      ${tableDetails.columns.chainId.field} TEXT NOT NULL, 
      ${tableDetails.columns.taskId.field} TEXT NOT NULL, 
      ${tableDetails.columns.from.field} TEXT NOT NULL, 
      ${tableDetails.columns.to.field} TEXT NOT NULL, 
      ${tableDetails.columns.abi.field} TEXT NOT NULL,
      ${tableDetails.columns.tokenAddress.field} TEXT NOT NULL,
      ${tableDetails.columns.tokenRate.field} REAL NOT NULL,
      ${tableDetails.columns.amountUsd.field} REAL NOT NULL,
      ${tableDetails.columns.bps.field} REAL NOT NULL,
      ${tableDetails.columns.tokenBack.field} REAL NOT NULL,
      ${tableDetails.columns.nftAddress.field} TEXT,
      ${tableDetails.columns.nftChainId.field} TEXT,
      ${tableDetails.columns.tokenId.field} BIGINT,
      ${tableDetails.columns.createdAt.field} timestamptz NOT NULL
    )`
  );
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idxTxnHash ON ${tableDetails.name} 
    ("${tableDetails.columns.txnHash.field}","${tableDetails.columns.chainId.field}")`
  );
};

const _initBalanceHistory = async () => {
  const tableDetails = psql.tables.balanceHistory;
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${tableDetails.name} (
      ${tableDetails.columns.owner.field} TEXT NOT NULL,
      ${tableDetails.columns.token.field} TEXT NOT NULL,
      ${tableDetails.columns.chainId.field} INT NOT NULL,
      ${tableDetails.columns.blockNumber.field} BIGINT NOT NULL,
      ${tableDetails.columns.currentBalance.field} BIGINT NOT NULL,
      ${tableDetails.columns.tokenPrice.field} REAL NOT NULL,
      ${tableDetails.columns.tokenValue.field} REAL NOT NULL,
      ${tableDetails.columns.cAt.field} timestamptz NOT NULL
    )`
  );

  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idxUniqueBalance ON ${tableDetails.name} 
    (
      "${tableDetails.columns.owner.field}",
      "${tableDetails.columns.token.field}",
      "${tableDetails.columns.chainId.field}",
      "${tableDetails.columns.blockNumber.field}"
    )`
  );
};

const _initIndexerConstants = async () => {
  try {
    const tableDetails = psql.tables.indexer_constants;
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${tableDetails.name} (
        ${tableDetails.columns.constants.field} JSONB
      )`
    );
  } catch (err) {
    console.log(
      `Error while initializing indexer constants table.`,
      err.message
    );
  }
};

const _initTasks = async () => {
  try {
    const tableDetails = psql.tables.tasks;
    await client.query(`DROP TABLE IF EXISTS ${tableDetails.name};`);
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${tableDetails.name} (
        ${tableDetails.columns.indexerId.field} SERIAL PRIMARY KEY,
        ${tableDetails.columns.taskId.field} TEXT,
        ${tableDetails.columns.contractAddr.field} TEXT,
        ${tableDetails.columns.abiName.field} TEXT,
        ${tableDetails.columns.type.field} TEXT,
        ${tableDetails.columns.chainId.field} BIGINT,
        ${tableDetails.columns.abi.field} TEXT,
        ${tableDetails.columns.track.field} TEXT [],
        ${tableDetails.columns.integrators.field} TEXT [],
        ${tableDetails.columns.filterParams.field} TEXT [],
        ${tableDetails.columns.webhook.field} JSONB
      )`
    );
  } catch (err) {
    console.log(
      `Error while initializing tasks table.`,
      err.message
    );
  }
};

const _initChainwiseTables = async (tableName, chainId) => {
  try {
    const tableDetails = psql.tables.txn;
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        ${tableDetails.columns.blockNumber.field} BIGINT NOT NULL,
        ${tableDetails.columns.fromAddr.field} CHARACTER(42),
        ${tableDetails.columns.gas.field} BIGINT NOT NULL,
        ${tableDetails.columns.gasPrice.field} BIGINT,
        ${tableDetails.columns.maxFeePerGas.field} BIGINT,
        ${tableDetails.columns.maxPriorityFeePerGas.field} BIGINT,
        ${tableDetails.columns.txnHash.field} CHARACTER(66) NOT NULL,
        ${tableDetails.columns.input.field} TEXT,
        ${tableDetails.columns.nonce.field} BIGINT,
        ${tableDetails.columns.toAddr.field} CHARACTER(42),
        ${tableDetails.columns.value.field} REAL,
        ${tableDetails.columns.type.field} BIGINT,
        ${tableDetails.columns.chainId.field} BIGINT NOT NULL,
        ${tableDetails.columns.receiptContractAddress.field} CHARACTER(42),
        ${tableDetails.columns.receiptCumulativeGasUsed.field} BIGINT,
        ${tableDetails.columns.receiptEffectiveGasPrice.field} BIGINT,
        ${tableDetails.columns.receiptGasUsed.field} BIGINT,
        ${tableDetails.columns.receiptLogsBloom.field} TEXT,
        ${tableDetails.columns.methodId.field} CHARACTER(10),
        ${tableDetails.columns.timestamp.field} BIGINT
      )`
    );

    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS idxTxn_${chainId} ON ${tableName} 
      (
        "${tableDetails.columns.txnHash.field}"
      )`
    );

    // Creating sparse indexes.
    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxTxnsFromAddr_${chainId} ON ${tableName} ("${tableDetails.columns.fromAddr.field}") WHERE ${tableDetails.columns.fromAddr.field} IS NOT NULL;`
      )
      .catch(console.error);

    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxTxnsToAddr_${chainId} ON ${tableName} ("${tableDetails.columns.toAddr.field}") WHERE ${tableDetails.columns.toAddr.field} IS NOT NULL;`
      )
      .catch(console.error);

    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxTxnsMethodId_${chainId} ON ${tableName} ("${tableDetails.columns.methodId.field}") WHERE ${tableDetails.columns.methodId.field} IS NOT NULL;`
      )
      .catch(console.error);
  } catch (err) {
    console.log(
      `Error while initializing txn table chainId: ${chainId} in psql.`,
      err.message
    );
  }
};

const _initTxn = async () => {
  try {
    const tableNames = [];
    Object.keys(rpc).forEach((key) => {
      tableNames.push(`txn_${key}`);
    });

    await Promise.all(
      tableNames.map(async (tableName) => {
        await _initChainwiseTables(tableName, parseInt(tableName.split("_")[1]));
      })
    );
  } catch (err) {
    console.log("Error while initializing txn table in psql.", err.message);
  }
};

const _initChainwiseLogs = async (tableName, chainId) => {
  try {
    const tableDetails = psql.tables.logs;
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        ${tableDetails.columns.txnHash.field} CHARACTER(66) NOT NULL,
        ${tableDetails.columns.fromAddr.field} CHARACTER(42),
        ${tableDetails.columns.contractAddr.field} CHARACTER(42),
        ${tableDetails.columns.topics.field} TEXT[],
        ${tableDetails.columns.data.field} TEXT,
        ${tableDetails.columns.logIndex.field} BIGINT
      )`
    );

    // Indexing txnHash, fromAddr, contractAddr & topics[0]
    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxLogsTxnHash_${chainId} ON ${tableName} ("${tableDetails.columns.txnHash.field}");`
      )
      .catch(console.error);

    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxFromAddr_${chainId} ON ${tableName} ("${tableDetails.columns.fromAddr.field}") WHERE ${tableDetails.columns.fromAddr.field} IS NOT NULL;`
      )
      .catch(console.error);

    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxContractAddr_${chainId} ON ${tableName} ("${tableDetails.columns.contractAddr.field}") WHERE ${tableDetails.columns.contractAddr.field} IS NOT NULL;`
      )
      .catch(console.error);
    
    client
      .query(
        `CREATE INDEX IF NOT EXISTS idxFirstTopic_${chainId} ON ${tableName} ((${tableDetails.columns.topics.field}[1])) WHERE (${tableDetails.columns.topics.field}[1]) IS NOT NULL;`
      )
      .catch(console.error);
  } catch (err) {
    console.log(
      `Error while initializing logs table chainId: ${chainId}.`,
      err.message
    );
  }
}

const _initLogs = async () => {
  try {
    const tableNames = [];
    Object.keys(rpc).forEach((key) => {
      tableNames.push(`logs_${key}`);
    });

    await Promise.all(
      tableNames.map(async (tableName) => {
        await _initChainwiseLogs(tableName, parseInt(tableName.split("_")[1]));
      })
    );
  } catch (err) {
    console.log("Error while initializing logs table in psql.", err.message);
  }
};

const saveTxnsToDb = async (dataRows, chainId) => {
  try {
    if (!dataRows.length) return;
    const tableDetails = psql.tables.txn;
    const keyTypeMap = {};
    const keys = Object.keys(dataRows[0]);
    const fields = [];
    const placeholderValues = [];
    const values = [];

    // create fields to update
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      keyTypeMap[key] = tableDetails.columns[key].type;
      fields.push(tableDetails.columns[key].field);
    }

    // create placeholder index and values to update
    let placeholderCount = 0;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const placeholderRow = [];

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const postfix = keyTypeMap[key] == "jsonb" ? "::jsonb" : "";

        placeholderRow.push(`$${placeholderCount + 1}${postfix}`);
        values.push(row[key]);
        placeholderCount++;
      }
      placeholderValues.push(`(${placeholderRow.join(",")})`);
    }

    const _placeholderValues = placeholderValues.join(",");
    const tableName = `txn_${chainId}`;

    await client.query(
      `INSERT INTO ${tableName}(${fields.join(",")}) VALUES ${_placeholderValues} ON CONFLICT (txn_hash) DO NOTHING;`,
      values
    );

    console.log(`Data inserted successfully on chainId: ${chainId}`);
  } catch (error) {
    console.error(`Error inserting txns on chainId: ${chainId}:`, error);
  }
};

const saveLogsToDb = async (dataRows, chainId) => {
  try {
    if (!dataRows.length) return;
    const tableDetails = psql.tables.logs;
    const keyTypeMap = {};
    const keys = Object.keys(dataRows[0]);
    const fields = [];
    const placeholderValues = [];
    const values = [];

    // create fields to update
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      keyTypeMap[key] = tableDetails.columns[key].type;
      fields.push(tableDetails.columns[key].field);
    }

    // create placeholder index and values to update
    let placeholderCount = 0;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const placeholderRow = [];

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const postfix = keyTypeMap[key] == "jsonb" ? "::jsonb" : "";

        placeholderRow.push(`$${placeholderCount + 1}${postfix}`);
        values.push(row[key]);
        placeholderCount++;
      }
      placeholderValues.push(`(${placeholderRow.join(",")})`);
    }

    const _placeholderValues = placeholderValues.join(",");
    const tableName = `logs_${chainId}`;

    await client.query(
      `INSERT INTO ${tableName}(${fields.join(",")}) VALUES ${_placeholderValues};`,
      values
    );

    console.log(`Logs inserted successfully on chainId: ${chainId}`);
  } catch (error) {
    console.error(`Error inserting logs on chainId: ${chainId}:`, error);
  }
};

const saveTasksHelper = async () => {
  try {
    const tasks = config;
    const dataRows = [];

    tasks.forEach((task) => {
      dataRows.push({
        taskId: task.taskId || null,
        contractAddr: task.contractAddress || null,
        abiName: task.abiName || null,
        type: task.type || null,
        chainId: task.chainId? parseInt(task.chainId) : null,
        abi: task.abi || null,
        track: task.track || [],
        integrators: task.integrators || [],
        filterParams: task.filterParams || [],
        webhook: task.webhook ? JSON.stringify(task.webhook) : "{}",
      });
    });

    await saveTasksToDb(dataRows);
  } catch (error) {
    console.error(`Error inserting Tasks.`, error);
  }
};

const saveTasksToDb = async (dataRows) => {
  try {
    if (!dataRows.length) return;
    const tableDetails = psql.tables.tasks;
    const keyTypeMap = {};
    const keys = Object.keys(dataRows[0]);
    const fields = [];
    const placeholderValues = [];
    const values = [];

    // create fields to update
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      keyTypeMap[key] = tableDetails.columns[key].type;
      fields.push(tableDetails.columns[key].field);
    }

    // create placeholder index and values to update
    let placeholderCount = 0;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const placeholderRow = [];

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const postfix = keyTypeMap[key] == "jsonb" ? "::jsonb" : "";

        placeholderRow.push(`$${placeholderCount + 1}${postfix}`);
        values.push(row[key]);
        placeholderCount++;
      }
      placeholderValues.push(`(${placeholderRow.join(",")})`);
    }

    const _placeholderValues = placeholderValues.join(",");
    const tableName = `tasks`;

    await client.query(
      `INSERT INTO ${tableName}(${fields.join(",")}) VALUES ${_placeholderValues};`,
      values
    );

    console.log(`Tasks inserted successfully.`);
  } catch (error) {
    console.error(`Error inserting Tasks.`, error);
  }
};

const init = async () => {
  await client.connect();
  await _initTxn();
  await _initLogs();
  await _initTokenBackTable();
  await _initBalanceHistory();
};

const insert = async ({ tableDetails, row, onConflictKeys = [] }) => {
  const keys = Object.keys(row);

  const fields = [];
  const placeholderValues = [];
  const values = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    fields.push(tableDetails.columns[key].field);
    placeholderValues.push(`$${i + 1}`);
    values.push(row[key]);
  }

  const _placeholderValues = `(${placeholderValues.join(",")})`;
  const _conflictDoNothing = onConflictKeys?.length ? `ON CONFLICT (${onConflictKeys.join(",")}) Do NOTHING` : "";

  const query = `
    insert into ${tableDetails.name}(${fields.join(",")}) values ${_placeholderValues} ${_conflictDoNothing};`;
  await client.query(query, values);
};

const _getLastTrackedBlocksDb = async () => {
  try {
    const blocks = {};
    const chainIds = Object.keys(rpc);

    await Promise.allSettled(
      chainIds.map(async (chainId) => {
        const res = await client.query(`
        SELECT MAX(block_number) FROM txn_${chainId};  
      `);

        blocks[chainId] = res?.rows[0]?.max || undefined;
      })
    );

    return blocks;
  } catch (err) {
    console.log("error getting last tracked blocks from db.", err.message);
  }
};

const getTxnsCountFromDb = async (chainId, blockNumber) => {
  try {
    const data = await client.query(`
        SELECT COUNT(*) FROM txn_${chainId} WHERE block_number = ${blockNumber};
      `);

    return parseInt(data?.rows[0]?.count || 0);
  } catch (err) {
    console.log(err.message);
  }
};

const getAllBlockNumbers = async (chainId) => {
  try {
    const data = await client.query(`
        SELECT DISTINCT block_number FROM txn_${chainId} ORDER BY block_number ASC;
      `);

    const blockNumbers = data?.rows.map((obj) => parseInt(obj.block_number)) || [];
    return blockNumbers;
  } catch (err) {
    console.log(err.message);
  }
};

const saveIndexerConstants = async () => {
  try {
    const tableDetails = psql.tables.indexer_constants;
    const data = JSON.stringify(constants);

    await client.query(
      `
        INSERT INTO ${tableDetails.name} (${tableDetails.columns.constants.field}) 
        VALUES ($1);
      `,
      [data]
    );
  } catch (err) {
    console.log(`Error saving indexer constants to db.`, err.message);
  }
};

module.exports = {
  init,
  insert,
  saveTxnsToDb,
  saveLogsToDb,
  _getLastTrackedBlocksDb,
  getTxnsCountFromDb,
  getAllBlockNumbers
};
