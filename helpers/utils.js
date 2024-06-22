const objectHash = require("object-hash");

const hashObject = (obj) => {
  return objectHash(obj || {});
};

// bson is of 12 bytes, so simple append 0x to it
const bsonIdToBytes12 = (bsonObjectId) => {
  if (!bsonObjectId || bsonObjectId?.toString()?.length != 24) return undefined;
  if (bsonObjectId?.toString()?.startsWith("0x")) return bsonObjectId;
  return `0x${bsonObjectId}`;
};

const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

module.exports = { hashObject, bsonIdToBytes12, isNumeric };
