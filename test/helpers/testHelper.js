const { client } = require("../../helpers/psqlHelper");
const { psql } = require("../../constants");

const _testForDuplicateLogs = async (chainId, txnHash, logIndex) => {
  try {
    const tableDetails = psql.tables.logs(chainId);

    const data = await client.query(`SELECT COUNT(*) FROM ${tableDetails.name} 
                                         WHERE ${tableDetails.columns.txnHash.field}='${txnHash}' AND
                                               ${tableDetails.columns.logIndex.field}='${logIndex}';
                                       `);

    return data.rows[0].count == "1";
  } catch (err) {
    console.error(`Error testing for duplicate logs.`, err.message);
  }
};

const _testForDuplicateTxns = async (chainId, txnHash) => {
  try {
    const tableDetails = psql.tables.txn(chainId);

    const data = await client.query(`SELECT COUNT(*) FROM ${tableDetails.name} 
                                WHERE ${tableDetails.columns.txnHash.field}='${txnHash}';
                               `);

    return data.rows[0].count == "1";
  } catch (err) {
    console.error(`Error testing for duplicate txns.`, err.message);
  }
};

const _getAllTableNames = async () => {
  try {
    const data =
      await client.query(`SELECT table_name FROM information_schema.tables
                                WHERE table_schema = 'public';
                               `);

    return data.rows || [];
  } catch (err) {
    console.error(`Error getting all tablenames.`, err.message);
  }
};

module.exports = {
  _testForDuplicateLogs,
  _testForDuplicateTxns,
  _getAllTableNames,
};
