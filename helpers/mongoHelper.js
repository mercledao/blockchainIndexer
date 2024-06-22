const { MongoClient } = require("mongodb");
const { mongodb } = require("../constants");

const db = {};

const init = async () => {
  if (process.env.ENV.startsWith("local")) {
    console.log("mongoHelper initialization", process.env.MONGO_URL);
  }
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const _db = client.db(process.env.MONGO_DB_NAME);

  db.indexer = _db.collection(mongodb.collections.indexer);
  await db.indexer.createIndex({ hash: 1 }, { unique: true });
  await db.indexer.createIndex({ blockNumber: -1, from: 1, to: 1, abi: 1, methodName: 1 });

  db.blocksTracked = _db.collection(mongodb.collections.blocksTracked);
  await db.blocksTracked.createIndex({ chainId: 1, blockNumber: 1 }, { unique: true });

  db.indexerConfig = _db.collection(mongodb.collections.indexerConfig);
  await db.indexerConfig.createIndex({ abi: 1 }, { unique: true, partialFilterExpression: { abi: { $exists: true } } });

  // contains failed webhook calls
  db.webhookFailedCalls = _db.collection(mongodb.collections.webhookFailedCalls);
  await db.webhookFailedCalls.createIndex({ hashId: 1 }, { unique: true });

  // initialized from backend
  db.events = _db.collection(mongodb.collections.events);
};

module.exports = { init, db };
