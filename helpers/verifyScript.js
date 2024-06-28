const { rpc } = require("../constants");
const { getBlockReceipts } = require("./ethersHelper");
const { getTxnsCountFromDb, getAllBlockNumbers } = require("./psqlHelper");

const verify = async () => {
  const chainIds = Object.keys(rpc);

  for (const chainId of chainIds) {
    console.log("Results for:", chainId);

    // get block nos.
    const blockNumbers = await getAllBlockNumbers(chainId);
    console.log(
      `range: ${blockNumbers[0]} - ${blockNumbers[blockNumbers.length - 1]}`
    );

    let missedBlocks = 0;
    for (let i = 0; i < blockNumbers.length; i++) {
      if (i > 0 && blockNumbers[i] - blockNumbers[i - 1] > 1)
        missedBlocks = missedBlocks + (blockNumbers[i] - blockNumbers[i - 1]);

      // count status 1 txns
      const receipts = await getBlockReceipts(
        chainId,
        blockNumbers[i]
      );
      let liveCount = 0;
      receipts.forEach((receipt) => {
        if (receipt.status === "0x1") liveCount++;
      });

      // get count from db for that block_number
      const dbCount = await getTxnsCountFromDb(
        chainId,
        blockNumbers[i]
      );

      if (liveCount != dbCount)
        console.log(
          `unsaved txns for ${blockNumbers[i]}:`,
          liveCount - dbCount
        );
    }

    console.log(`Verification completed! missed blocks: ${missedBlocks}`);
  }
};

module.exports = { verify };
