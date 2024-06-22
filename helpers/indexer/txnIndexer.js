const { ethers } = require("ethers");
const { abi, rpc } = require("../../constants");
const ethersHelper = require("../ethersHelper");

const testData = require("../data/testData");

const lifiHelper = require("../taskHelpers/lifiHelper");
const cowswapHelper = require("../taskHelpers/cowswapHelper");
const zeroXHelper = require("../taskHelpers/zeroEx/zeroXHelper");
const oneInchHelper = require("../taskHelpers/oneInch/oneInchHelper");
const shapeshiftHelper = require("../taskHelpers/shapeshift/shapeshiftHelper");
const idleFinanceHelper = require("../taskHelpers/idleFinance/idleFinanceHelper");
const splitProtocolHelper = require("../taskHelpers/splitProtocol/splitProtocolHelper");
const reaxHelper = require("../taskHelpers/reax/reaxHelper");
const fxdxHelper = require("../taskHelpers/fxdx/fxdxHelper");
const blastHelper = require("../taskHelpers/blast/blastHelper");
const zksyncHelper = require("../taskHelpers/zksync/zksyncHelper");
const loonscapeHelper = require("../taskHelpers/loonscape/loonscapeHelper");
const yatHelper = require("../taskHelpers/yatHelper");
const poapHelper = require("../taskHelpers/poapHelper");
const quickSwapHelper = require("../taskHelpers/quickSwap/quickSwapHelper");
const quickSwapLpHelper = require("../taskHelpers/quickSwap/quickSwapLpHelper");
const quickSwapLpGammaHelper = require("../taskHelpers/quickSwap/quickSwapLpGammaHelper");
const quickSwapLpV2Helper = require("../taskHelpers/quickSwap/quickSwapLpV2Helper");
const quickSwapLpIchiHelper = require("../taskHelpers/quickSwap/quickSwapLpIchiHelper");
const quickSwapStakeHelper = require("../taskHelpers/quickSwap/quickSwapStakeHelper");
const quickSwapBondHelper = require("../taskHelpers/quickSwap/quickSwapBondHelper");
const quickSwapBondApeHelper = require("../taskHelpers/quickSwap/quickSwapBondApeHelper");
const berachainHelper = require("../taskHelpers/berachain/berachainHelper");
const scrollchainHelper = require("../taskHelpers/scrollchain/scrollchainHelper");
const vaultCraftLpHelper = require("../taskHelpers/vaultCraft/vaultCraftLpHelper");
const vaultCraftStakeHelper = require("../taskHelpers/vaultCraft/vaultCraftStakeHelper");
const vaultCraftMintHelper = require("../taskHelpers/vaultCraft/vaultCraftMintHelper");
const vaultCraftExerciseHelper = require("../taskHelpers/vaultCraft/vaultCraftExerciseHelper");
const vaultCraftCreateVaultHelper = require("../taskHelpers/vaultCraft/vaultCraftCreateVaultHelper");

const processTxn = {
  lifiDiamondAbi: lifiHelper.processLifi,
  cowswapGpV2SettlementAbi: cowswapHelper.processCowSwapGpV2Settlement,
  cowswapEthFlowAbi: cowswapHelper.processCowSwapEthFlow,
  zeroExAbi: zeroXHelper.processTxn,
  oneInchV4Abi: oneInchHelper.processTxnV4,
  oneInchV5Abi: oneInchHelper.processTxnV5,
  shapeshiftIdleFinCdoAbi: shapeshiftHelper.processIdleFinCdoTxn,
  idleTokenAbi: idleFinanceHelper.processTxn,
  splitRouterAbi: splitProtocolHelper.processTxn,
  reaxAbi: reaxHelper.processTxn,
  reaxVaultAbi: reaxHelper.processTxn,
  reaxMiniChefV2Abi: reaxHelper.processTxn,
  reaxNoAbi: reaxHelper.processTxn,
  reaxSynthPoolAbi: reaxHelper.processTxn,
  wrappedTokenGatewayV3Abi: reaxHelper.processTxn,
  fxdxFastPriceFeedAbi: fxdxHelper.processTxn,
  fxdxRewardRouterV3Abi: fxdxHelper.processTxn,
  blastBridgeAbi: blastHelper.processTxn,
  loonscapeMmsTokenAbi: loonscapeHelper.processTxn,
  zksyncZfRouterAbi: zksyncHelper.processTxn,
  berachainErc20DexAbi: berachainHelper.processTxn,

  scrollSyncSwapRouterAbi: scrollchainHelper.processTxn,
  scrollSyncSwapRouterV2Abi: scrollchainHelper.processTxn,

  quickSwapAgustusSwapperAbi: quickSwapHelper.processTxn,
  quickSwapSteerPeripheryAbi: quickSwapLpHelper.processTxn,
  quickSwapGammaUniProxyAbi: quickSwapLpGammaHelper.processTxn,
  quickSwapAlgebraPositionsNftV1Abi: quickSwapLpHelper.processTxn,
  quickSwapUniswapV2Router02Abi: quickSwapLpV2Helper.processTxn,
  quickSwapICHIVaultDepositGuardAbi: quickSwapLpIchiHelper.processTxn,
  quickSwapDragonLairAbi: quickSwapStakeHelper.processTxn,
  quickSwapSoulZap_UniV2_Extended_V1Abi: quickSwapBondHelper.processTxn,
  quickswapBondCustomBillRefillableAbi: quickSwapBondApeHelper.processTxn,

  yatNftAbi: yatHelper.processYat,
  poapAbi: poapHelper.processPoap,

  vaultCraftVaultAbi: vaultCraftLpHelper.processTxn,
  vaultCraftAuraBoosterAbi: vaultCraftStakeHelper.processTxn,
  vaultCraftVotingEscrowAbi: vaultCraftMintHelper.processTxn,
  vaultCraftOptionsTokenAbi: vaultCraftExerciseHelper.processTxn,
  vaultCraftCreateVaultNoAbi: vaultCraftCreateVaultHelper.processTxn,
};

const consumeReceiptForTxn = async (task, trackTxns, chainId, receipt) => {
  const contractDetails = trackTxns?.[chainId]?.[receipt.to];
  if (!contractDetails) return;

  const taskDetails = task[contractDetails.taskId];
  if (!taskDetails) return;

  let tx = { hash: receipt.transactionHash };
  try {
    tx = await ethersHelper.tryGetTransaction(chainId, receipt.transactionHash);
    if (!tx) return;

    tx.receipt = receipt;
    tx.chainId = chainId;

    return _process(chainId, tx, taskDetails)
  } catch (e) {
    console.error(`Could not track txn::${chainId}::${tx.hash}`, e);
  }
};

const consumeTxnGeth = async (task, trackTxns, chainId, tx) => {
  const contractDetails = trackTxns?.[chainId]?.[tx.to];
  if (!contractDetails) return;

  const taskDetails = task[contractDetails.taskId];
  if (!taskDetails) return;

  try {
    const receipt = await ethersHelper.tryGetReceipt(chainId, tx.hash)
    if (!receipt || parseInt(receipt.status) != 1) return;

    tx.receipt = receipt;
    tx.chainId = chainId;

    // process the txn
    return _process(chainId, tx, taskDetails)
  } catch (e) {
    console.error(`Could not track txn::${chainId}::${tx.hash}`, e);
  }
};

const _process = (chainId, tx, taskDetails) => {
  let found = [true];
  if (!taskDetails.abi?.endsWith("NoAbi")) {
    const interface = new ethers.utils.Interface(abi[taskDetails.abi]);

    const txn = interface.parseTransaction(tx);
    tx.interface = interface;
    tx.parsedTxn = txn;

    if (taskDetails.track?.length) {
      found = taskDetails.track.filter((toTrackSubString) =>
        txn.name.toLowerCase().includes(toTrackSubString.toLowerCase())
      );
    }
  }

  return processTxn[taskDetails.abi]({ task: taskDetails, chainId, txn: tx, tagsFound: new Set(found) });
}

const _testIndexer = async ({ chainId }) => {
  const txns = testData.lineaTxn[chainId];

  const provider = ethersHelper.getProvider(chainId);
  for (let i = 0; i < txns?.length; i++) {

    if (rpc[chainId].geth) {
      const tx = await provider.getTransaction(txns[i])
      tx.chainId = chainId
      await consumeTxnGeth(testData.task, testData.trackTxns, chainId, tx)
    } else {
      const receipt = await provider.getTransactionReceipt(txns[i]);
      await consumeReceiptForTxn(testData.task, testData.trackTxns, chainId, receipt);
    }
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
  consumeReceiptForTxn,
  consumeTxnGeth,
};
