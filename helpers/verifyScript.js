const {
  getBlockReceipts,
  getBlockNumber,
  getBlockTransactionsWithoutChecksum,
  getProvider
} = require("./ethersHelper");
const { getTxnsCountFromDb } = require("./psqlHelper");

const verify = async (chainId) => {
  // get block no.
  const blockNumber = await getProvider(chainId).getBlockNumber();

//   // get txns & receipts for it.
//   const txns = await getBlockTransactionsWithoutChecksum(
//     chainId,
//     parseInt(blockNumber)
//   );
//   const receipts = await getBlockReceipts(chainId, parseInt(blockNumber));
  
//   // group
//   const mp = {}; 
//   receipts.forEach((receipt, index) => {
//     mp[receipt.transactionHash] = index;
//   });

//   txns.forEach((tx) => {
//     tx.receipt = receipts[mp[tx.hash]];
//   });

//   // count status 1 txns
//   let liveCount = 0;
//   txns.forEach((txn) => {
//     if (txn.receipt.status === "0x1") 
//       liveCount++;
//   });

//   // get count from db for that block_number
//   const dbCount = await getTxnsCountFromDb(chainId, parseInt(blockNumber));

  // match
  console.log("soup\n", blockNumber);
};

module.exports = { verify };
