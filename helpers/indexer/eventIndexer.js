const { ethers } = require("ethers");
const { abi, rpc } = require("../../constants");
const ethersHelper = require("../ethersHelper");

const testData = require("../data/testData");

const mercleHelper = require("../taskHelpers/mercle/mercleHelper");
const erc20Helper = require("../taskHelpers/misc/erc20Helper");
const sentimentHelper = require("../taskHelpers/sentiment/sentimentHelper");

const processEvent = {
  mercleNftAbi: mercleHelper.processEvent,
  erc20Abi: erc20Helper.processEvent,
  sentimentSuperPoolAbi: sentimentHelper.processEvent,
};

const consumeReceiptForEvent = async (task, trackEvents, chainId, receipt) => {
  const provider = ethersHelper.getProvider(chainId);

  const processingLogs = [];

  for (let i = 0; i < receipt?.logs?.length; i++) {
    const log = receipt.logs[i];
    const contractAddress = ethers.utils.getAddress(log.address);

    const contractDetails = trackEvents?.[chainId]?.[contractAddress];
    for (let j = 0; j < contractDetails?.length; j++) {
      try {
        const contractDetail = contractDetails[j];
        const taskDetails = task[contractDetail.taskId];
        if (!taskDetails) continue;

        const interface = new ethers.utils.Interface(abi[taskDetails.abi]);
        const parsedLog = interface.parseLog(log);
        parsedLog.transactionHash = receipt.transactionHash;
        parsedLog.event = parsedLog.name;
        parsedLog.address = contractAddress;
        parsedLog.blockNumber = BigInt(receipt.blockNumber).toString();

        if (parsedLog.name != taskDetails.eventName) continue;

        // if filter params doesn't match ignore
        const filterConfig = contractDetail.filterParams || taskDetails.filterParams;
        const matchedParams = filterConfig?.filter((filter, k) => !filter || filter == parsedLog.args[k]);
        if (matchedParams?.length < filterConfig?.length) continue;

        processingLogs.push(
          processEvent[taskDetails.abi]({
            task: taskDetails,
            event: parsedLog,
            events: [parsedLog],
            chainId,
            contractDetails: contractDetail,
            contract: new ethers.Contract(contractAddress, abi[taskDetails.abi], provider),
          })
        );
      } catch (e) {
        console.error(`Could not track event::${chainId}::${receipt.transactionHash}`, e);
      }
    }
  }

  return processingLogs;
};

const _testIndexer = async ({ chainId }) => {
  const txns = testData.mercleNftMintEventTxn[chainId];

  const provider = ethersHelper.getProvider(chainId);
  for (let i = 0; i < txns?.length; i++) {
    const receipt = await provider.getTransactionReceipt(txns[i]);

    await consumeReceiptForEvent(testData.task, testData.trackEvents, chainId, receipt);
  }
};

const runIndexerTest = async () => {
  const supportedChains = Object.keys(rpc);
  supportedChains.forEach(async (chainId) => {
    console.log(`listen to ${chainId}`);
    _testIndexer({ chainId });
  });
};

module.exports = {
  runIndexerTest,
  consumeReceiptForEvent,
};
