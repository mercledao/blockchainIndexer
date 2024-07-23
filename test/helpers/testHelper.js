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

// to be used inside blockConsumer ( as _saveTxns is not imported here )
const _saveInDb = async (chainId, txnHash) => {
  try {
    const receipts = [];
    let data = await ethersHelper.getTxnReceipt(chainId, txnHash);
    receipts.push(data);

    const txns = []; // Grouped
    data = await ethersHelper.getTxnByHash(chainId, txnHash);
    txns.push(data);

    const obj = await ethersHelper.getBlockTransactions(
      chainId,
      txns[0].blockNumber
    );

    await _saveTxnsWithReceipt(chainId, receipts, txns, obj.timestamp);
  } catch (err) {
    console.error("Error while saving test txns.", err.message);
  }
};

const saveTestTxns = async () => {
  for (const txn of testTxns) {
    await _saveInDb(txn.chainId, txn.txnHash.toLowerCase());
  }

  console.log("All testTxns inserted\n");
};

module.exports = {
  _testForDuplicateLogs,
  _testForDuplicateTxns,
  _getAllTableNames,
  saveTestTxns,
};
