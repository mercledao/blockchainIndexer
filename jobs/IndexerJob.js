const blockProducer = require("../helpers/indexer/blockProducer");
const blockConsumer = require("../helpers/indexer/blockConsumer");

const txnIndexer = require("../helpers/indexer/txnIndexer");
const eventIndexer = require("../helpers/indexer/eventIndexer");

const init = async () => {
  if (process.env.ENV.endsWith("_jobs")) {
    await blockProducer.init();
  }
  await blockConsumer.init();
  //
  // --------test helpers-------------
  // await txnIndexer.runIndexerTest();
  // await eventIndexer.runIndexerTest();
  // ---------------------------------
};

module.exports = { init };
