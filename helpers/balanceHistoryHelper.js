const { psql } = require("../constants");
const psqlHelper = require("./psqlHelper");

/**
 * @param {psql.tables.balanceHistory.columns} data
 */
const trackBalanceHistory = async ({ data }) => {
  try {
    await _insertTokenBack(data);
  } catch (e) {
    console.error(
      `could not trackBalanceHistory ${data.owner}::${data.token}::${data.chainId}::${data.blockNumber}`,
      e
    );
  }
};

const _insertTokenBack = async (data = {}) => {
  const tableDetails = psql.tables.balanceHistory;

  await psqlHelper.insert({
    tableDetails,
    row: { ...data, currentBalance: BigInt(data.currentBalance.toString()), cAt: new Date() },
    onConflictKeys: [
      tableDetails.columns.owner.field,
      tableDetails.columns.token.field,
      tableDetails.columns.chainId.field,
      tableDetails.columns.blockNumber.field,
    ],
  });
};

module.exports = { trackBalanceHistory };
