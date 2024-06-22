const { ethers } = require("ethers");
const tokenPriceHelper = require("../../tokenPrice/tokenPriceHelper");
const { enums, misc } = require("../../../constants");

const createVault = async ({ txn }) => {
  const methodId = "0xed8725d9";
  if (!txn.data.toString().includes(methodId)) return;

  const data = {
    // from: txn.from,
    // to: txn.to,
  };

  data.tag = enums.TaskTag.createVault;

  return data;
};

module.exports = {
  createVault,
};
