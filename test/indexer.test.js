require("dotenv").config();
const chai = require("chai");
const {
  saveLogsToDb,
  _testForDuplicateLogs,
  saveTxnsToDb,
  _testForDuplicateTxns,
  _getAllTableNames,
} = require("../helpers/psqlHelper");
const { rpc } = require("../constants");
const expect = chai.expect;

describe("Indexer tests", function () {
  this.timeout(60000 * 5); // 5mins
  before(async () => {
    await require("../helpers/psqlHelper").init();
    await require("../helpers/cacheHelper").init();
    require("../helpers/ethersHelper").init();
  });

  // covers normal insertion as well by making sure that exactly 1 insertion is done
  it("duplicate logs test.", async () => {
    const dataRows = [
      {
        txnHash:
          "0x49039fc7cce603f841369ef28b0e85d8b834ce29e77118d2a9851b44c82a505f",
        fromAddr: "0x7ccdb15ff25dddb23dd0efc98844e07683cd8ba6",
        contractAddr: "0x8802269d1283cdb2a5a329649e5cb4cdcee91ab6",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x0000000000000000000000005f9ecf757137d5ef4330ab72d18163c2f221befd",
          "0x00000000000000000000000063a151d042dc870fb1b3f0c72cbbdd53a85898f6",
        ],
        data: "0x00000000000000000000000000000000000000000000000000005f32ee3d5380",
        logIndex: 0,
      },
    ];
    const chainId = 80085;

    // save twice
    await saveLogsToDb(dataRows, chainId);
    await saveLogsToDb(dataRows, chainId);

    const res = await _testForDuplicateLogs(
      chainId,
      dataRows[0].txnHash,
      dataRows[0].logIndex
    );
    expect(res).eq(true);
  });

  it("duplicate txns test.", async () => {
    const dataRows = [
      {
        blockNumber: 40666152,
        fromAddr: "0xa640229ab30370ee6cb802cee164a36907341347",
        gas: 25000,
        gasPrice: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        txnHash:
          "0x3bb3f659fcb3e7accad3833578ee28161068fd5108a8ad147871e2ba7b63296b",
        input:
          "0x626c6f636b206275696c7420627920626c6f636b72617a6f722e2076697369742075732061743a207777772e626c6f636b72617a6f722e696f2c206a6f696e20646973636f72643a20646973636f72642e67672f71714a75775262384e682c20583a2068747470733a2f2f782e636f6d2f426c6f636b52617a6f725f496e63",
        nonce: 487862,
        toAddr: "0xa640229ab30370ee6cb802cee164a36907341347",
        value: "0x0",
        type: 0,
        chainId: 56,
        receiptContractAddress: null,
        receiptCumulativeGasUsed: 23032,
        receiptEffectiveGasPrice: 0,
        receiptGasUsed: 23032,
        receiptLogsBloom:
          "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        methodId: "0x626c6f63",
        timestamp: 1721563559,
      },
    ];
    const chainId = 56;

    // save twice
    await saveTxnsToDb(dataRows, chainId);
    await saveTxnsToDb(dataRows, chainId);

    const res = await _testForDuplicateTxns(chainId, dataRows[0].txnHash);
    expect(res).eq(true);
  });

  it("should have all txn & logs tables", async () => {
    const data = await _getAllTableNames();
    const tableNames = data.map((item) => item.table_name);
    const chainIds = Object.keys(rpc);

    chainIds.forEach((chainId) => {
      expect(tableNames).to.include(`txn_${chainId}`);
      expect(tableNames).to.include(`logs_${chainId}`);
    });
  });

  // also checks that 1 txn can have multiple logs
  it("partial & then complete re-insertion of logs", async () => {
    const dataRows = [
      {
        txnHash:
          "0x3b4a9f6aad80759ac6ab0bc52a6e98546d99e8b330373e0073a579582635b3d9",
        fromAddr: "0xdb9c122630b029083a1d08c0c59bfc03048aa890",
        contractAddr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000db9c122630b029083a1d08c0c59bfc03048aa890",
          "0x000000000000000000000000c1cb7f41cc17077eb05e22801ec636709f4fc0ca",
        ],
        data: "0x000000000000000000000000000000000000000000000000122aa58ea4754a00",
        logIndex: 0,
      },
      {
        txnHash:
          "0x3b4a9f6aad80759ac6ab0bc52a6e98546d99e8b330373e0073a579582635b3d9",
        fromAddr: "0xdb9c122630b029083a1d08c0c59bfc03048aa890",
        contractAddr: "0x7cb683151a83c2b10a30cbb003cda9996228a2ba",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000c1cb7f41cc17077eb05e22801ec636709f4fc0ca",
          "0x000000000000000000000000db9c122630b029083a1d08c0c59bfc03048aa890",
        ],
        data: "0x0000000000000000000000000000000000000070479a93a3c149981d53afe3f4",
        logIndex: 1,
      },
      {
        txnHash:
          "0x3b4a9f6aad80759ac6ab0bc52a6e98546d99e8b330373e0073a579582635b3d9",
        fromAddr: "0xdb9c122630b029083a1d08c0c59bfc03048aa890",
        contractAddr: "0xc1cb7f41cc17077eb05e22801ec636709f4fc0ca",
        topics: [
          "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
        ],
        data: "0x00000000000000000000000000000000000008debb212b59f655390287212b4a0000000000000000000000000000000000000000000000018076984762f79f05",
        logIndex: 2,
      },
    ];
    const chainId = 80085;
    const partialDataRow = dataRows.slice(0, 1);

    await saveLogsToDb(partialDataRow, chainId);
    await saveLogsToDb(dataRows, chainId);

    dataRows.forEach(async (row) => {
      // this fx makes sure that there is exactly 1 insertion for 1 log
      const res = await _testForDuplicateLogs(
        chainId,
        row.txnHash,
        row.logIndex
      );

      expect(res).eq(true);
    });
  });
});
