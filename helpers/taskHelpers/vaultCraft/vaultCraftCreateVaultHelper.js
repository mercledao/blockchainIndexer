const dataPublisher = require("../../indexer/dataPublisherHelper");
const { enumsComplex } = require("../../../constants");
const vaultCraftCreateVaultParser = require("./vaultCraftCreateVaultParser");

const processTxn = async ({ task, txn, tagsFound }) => {
  let data;
  const parser = vaultCraftCreateVaultParser["createVault"];
  if (!parser) return;
  data = await parser?.({ txn });

  const shouldTrack = data;

  if (shouldTrack) {
    dataPublisher.pushData({
      task,
      txn,
      data,
      taskType: enumsComplex.EventTypes.VaultCraftCreateVault.name,
      amountUsd: data.amountUsd,
      realFrom: data.realFrom, // is nullable
      tag: data.tag,
    });
  }
};

module.exports = { processTxn };
