const { enums } = require("../../../constants");

const create_lock = async ({ txn }) => {
  const txnArgs = txn.parsedTxn.args;

  const data = {
    // _unlock_time: txnArgs._unlock_time.toString(),
    // _value: txnArgs._value.toString(),
  };

  data.tag = enums.TaskTag.mint;

  return data;
};

module.exports = {
  create_lock,
};
