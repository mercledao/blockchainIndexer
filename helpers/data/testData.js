const { ethers } = require("ethers");

const task = {
  "0x64b6f61abd8d6c1556063bb0": {
    abi: "lifiDiamondAbi",
    track: ["bridge"],
    integrators: new Set(["shapeshift", "0x90a48d5cf7343b08da12e067680b4c6dbfe551be", "jumper.exchange"]),
  },
  "0x64b6f61abd8d6c1556063bb1": {
    abi: "cowswapGpV2SettlementAbi",
    track: ["settle", "swap"],
    integrators: new Set(["shapeshift", "cow swap"]), // lowercase
  },
  "0x64b6f61abd8d6c1556063bb2": {
    abi: "cowswapEthFlowAbi",
    track: ["createOrder"],
    integrators: new Set(["shapeshift", "cow swap"]), // lowercase
  },
  "0x64b6f61abd8d6c1556063bb3": {
    abi: "yatNftAbi",
    track: ["mint", "transfer"],
  },
  "0x64b6f61abd8d6c1556063bb4": {
    abi: "poapAbi",
    track: ["mint", "transfer"],
    eventIds: new Set([12345]),
  },
  "0x64b6f61abd8d6c1556063bb5": {
    abi: "zeroExAbi",
    track: ["transformERC20"],
    integrators: new Set([
      "0x90a48d5cf7343b08da12e067680b4c6dbfe551be",
      "0x6268d07327f4fb7380732dc6d63d95f88c0e083b",
      "0x74d63f31c2335b5b3ba7ad2812357672b2624ced",
      "0xb5f944600785724e31edb90f9dfa16dbf01af000",
      "0xb0e3175341794d1dc8e5f02a02f9d26989ebedb3",
      "0x8b92b1698b57bedf2142297e9397875adbb2297",
    ]), // lowercase
  },
  "0x64b6f61abd8d6c1556063bb6": {
    abi: "oneInchV4Abi",
    track: ["swap"],
    integrators: new Set([
      "0x90a48d5cf7343b08da12e067680b4c6dbfe551be",
      "0x6268d07327f4fb7380732dc6d63d95f88c0e083b",
      "0x74d63f31c2335b5b3ba7ad2812357672b2624ced",
      "0xb5f944600785724e31edb90f9dfa16dbf01af000",
      "0xb0e3175341794d1dc8e5f02a02f9d26989ebedb3",
      "0x8b92b1698b57bedf2142297e9397875adbb2297",
    ]), // lowercase
  },
  "0x64b6f61abd8d6c1556063bc6": {
    abi: "oneInchV5Abi",
    track: ["swap"],
    integrators: new Set([
      "0x90a48d5cf7343b08da12e067680b4c6dbfe551be",
      "0x6268d07327f4fb7380732dc6d63d95f88c0e083b",
      "0x74d63f31c2335b5b3ba7ad2812357672b2624ced",
      "0xb5f944600785724e31edb90f9dfa16dbf01af000",
      "0xb0e3175341794d1dc8e5f02a02f9d26989ebedb3",
      "0x8b92b1698b57bedf2142297e9397875adbb2297",
    ]), // lowercase
  },
  "0x64b6f61abd8d6c1556063bb7": {
    abi: "shapeshiftIdleFinCdoAbi",
    track: ["depositAA", "depositBB"],
  },
  "0x64b6f61abd8d6c1556063bb8": {
    abi: "idleTokenAbi",
    track: ["mintIdleToken"],
    integrators: new Set(["0xdac17f958d2ee523a2206206994597c13d831ec7"]), // lowercase
  },
  "0x64b6f61abd8d6c1556063bb9": {
    abi: "splitRouterAbi",
  },
  "0x64b6f61abd8d6c1556063cc0": {
    abi: "reaxAbi",
    track: ["supply", "supplyWithPermit"],
  },
  "0x64b6f61abd8d6c1556063cc1": {
    abi: "reaxVaultAbi",
    track: ["joinPool"],
  },
  "0x64b6f61abd8d6c1556063cc2": {
    abi: "reaxMiniChefV2Abi",
    track: ["multicall"],
  },
  "0x64b6f61abd8d6c1556063cc3": {
    abi: "reaxNoAbi",
  },
  "0x64b6f61abd8d6c1556063cc4": {
    abi: "reaxSynthPoolAbi",
    track: ["mint"],
  },
  "0x64b6f61abd8d6c1556063cc5": {
    abi: "wrappedTokenGatewayV3Abi",
    track: ["depositETH"],
  },

  "0x6572b847a6c850af7e0a4c58": {
    abi: "fxdxFastPriceFeedAbi",
    track: ["setPricesWithBitsAndExecute"],
  },
  "0x6572b847a6c850af7e0a4c59": {
    abi: "fxdxRewardRouterV3Abi",
    track: ["stake"],
  },

  "0x65cc78525a58054d910b2b67": {
    abi: "blastBridgeAbi",
    track: [
      "depositDAI",
      "depositETH",
      "depositStETH",
      "depositUSDC",
      "depositUSDT",
      "depositStETHWithPermit",
      "depositDAIWithPermit",
      "depositUSDCWithPermit",
    ],
  },

  "0x65dc96f1fb5fbdd09c0fef7e": {
    abi: "zksyncZfRouterAbi",
    track: ["swapExactETHForTokens"],
  },

  "0x65d069538adbd9f63605faa1": {
    abi: "loonscapeMmsTokenAbi",
    track: ["mint"],
  },

  "0x65e5fa71c59bedad3d0458c4": {
    abi: "berachainErc20DexAbi",
    track: ["addLiquidity", "swap", "batchSwap"],
  },

  // mercle nft mint tasks
  "0x6585409739c106bcd6095541": {
    abi: "mercleNftAbi",
    eventName: "Transfer",
    filterParams: [ethers.constants.AddressZero],
    webhook: {
      url: "http://localhost:3001/test",
      config: {
        headers: { auth: "hello bello" },
        body: { anotherData: "yes yes" },
      },
    },
  },
  "0x660e71a48fa0b2f1e4016b42": {
    abi: "erc20Abi",
    eventName: "Transfer",
    filterParams: [null, "0xf5fDbf0aF9a37f248A943949E2903f9E3C7d297B"],
  },
  "0x661a752f8dbbbfdaea075112": {
    abi: "sentimentSuperPoolAbi",
    eventName: "Transfer",
  },

  // quickSwap swap task
  "0x65d069538adbd9f63605faa2": {
    abi: "quickSwapAgustusSwapperAbi",
    track: ["swap", "buy"],
  },

  // quickSwap Lp task
  // steer
  "0x65d069538adbd9f63605faa3": {
    abi: "quickSwapSteerPeripheryAbi",
    track: ["deposit"],
  },
  // gamma
  "0x65fd426b76268e470a05307d": {
    abi: "quickSwapGammaUniProxyAbi",
    track: ["deposit"],
  },
  // manual
  "0x65fd426b76268e470a05307c": {
    abi: "quickSwapAlgebraPositionsNftV1Abi",
    track: ["multicall"],
  },
  // v2
  "0x65fd426b76268e470a05307e": {
    abi: "quickSwapUniswapV2Router02Abi",
    track: ["addLiquidity", "addLiquidityETH"],
  },
  // single token
  "0x65fd426b76268e470a05307f": {
    abi: "quickSwapICHIVaultDepositGuardAbi",
    track: ["forwardDepositToICHIVault"],
  },
  // quickSwap Stake task
  "0x65d069538adbd9f63605faa4": {
    abi: "quickSwapDragonLairAbi",
    track: ["enter"],
  },
  // quickSwap Bond task
  "0x65d069538adbd9f63605faa5": {
    abi: "quickSwapSoulZap_UniV2_Extended_V1Abi",
    track: ["zapBond", "zap"],
  },
  // quickswap ape bond task
  "0x65feddbc86e7f1cbc0049593": {
    abi: "quickswapBondCustomBillRefillableAbi",
    track: ["deposit"],
  },

  // scroll swap
  "0x65e89128b27f189bde06b09a": {
    abi: "scrollSyncSwapRouterAbi",
    track: ["swap", "swapWithPermit"],
  },
  "664d949d59c7e1fa9a0a37d0": {
    abi: "scrollSyncSwapRouterV2Abi",
    track: ["swap", "swapWithPermit", "addLiquidity", "addLiquidity2", "addLiquidityWithPermit", "addLiquidityWithPermit2"],
  },


  //VaultCraft VaultAbi
  "0x65cc78525a58054d910b2b68": {
    abi: "vaultCraftVaultAbi",
    track: ["joinPool", "swap"],
  },
  //VaultCraft AuraBoosterAbi
  "0x65cc78525a58054d910b2b69": {
    abi: "vaultCraftAuraBoosterAbi",
    track: ["deposit"],
  },
  //VaultCraft AuraBoosterAbi
  "0x65cc78525a58054d910b2b70": {
    abi: "vaultCraftVotingEscrowAbi",
    track: ["create_lock"],
  },
  //VaultCraft AuraBoosterAbi
  "0x65cc78525a58054d910b2b71": {
    abi: "vaultCraftOptionsTokenAbi",
    track: ["exercise"],
  },
  //VaultCraft CreateVault
  "0x65cc78525a58054d910b2b72": {
    abi: "vaultCraftCreateVaultNoAbi",
  },
};

const trackEvents = {
  534352: {
    "0x9c31e124C34C9743bf9631136CB6c5F91DF529B9": [
      {
        taskId: "0x6585409739c106bcd6095541",
        webhook: {
          config: {
            headers: { eventTaskHeader2: "nice pice" },
            body: { commId: "1234567" },
          },
        },
      },
    ],
  },
  421614: { "0x9aA40Cc99973d8407a2AE7B2237d26E615EcaFd2": [{ taskId: "0x660e71a48fa0b2f1e4016b42" }] },
};

const trackTxns = {
  1: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
    "0x9008D19f58AAbD9eD0D60971565AA8510560ab41": {
      taskId: "0x64b6f61abd8d6c1556063bb1",
    },
    "0x7d256d82b32d8003d1cA1a1526ED211E6e0dA9e2": {
      taskId: "0x64b6f61abd8d6c1556063bb3",
    },
    "0xDef1C0ded9bec7F1a1670819833240f027b25EfF": {
      taskId: "0x64b6f61abd8d6c1556063bb5",
    },
    "0x1111111254fb6c44bAC0beD2854e76F90643097d": {
      taskId: "0x64b6f61abd8d6c1556063bb6",
    },
    "0x1111111254EEB25477B68fb85Ed929f73A960582": {
      taskId: "0x64b6f61abd8d6c1556063bc6",
    },
    "0x4aAc17D48E4Ccb4e1c53cAfBe4934FeE899009C4": {
      taskId: "0x64b6f61abd8d6c1556063bb7",
    },
    "0x5274891bEC421B39D23760c04A6755eCB444797C": {
      taskId: "0x64b6f61abd8d6c1556063bb8",
    },
    "0x40A50cf069e992AA4536211B23F286eF88752187": {
      taskId: "0x64b6f61abd8d6c1556063bb2",
    },
    "0x5F6AE08B8AeB7078cf2F96AFb089D7c9f51DA47d": {
      taskId: "0x65cc78525a58054d910b2b67",
    },

    //vaultCraft Vault Address
    "0xBA12222222228d8Ba445958a75a0704d566BF2C8": {
      taskId: "0x65cc78525a58054d910b2b68",
    },
    //vaultCraft AuraBooster Address
    "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234": {
      taskId: "0x65cc78525a58054d910b2b69",
    },

    //vaultCraft VotingEscorw
    "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A": {
      taskId: "0x65cc78525a58054d910b2b70",
    },
    //vaultCraft OptionsToken
    "0xaFa52E3860b4371ab9d8F08E801E9EA1027C0CA2": {
      taskId: "0x65cc78525a58054d910b2b71",
    },
    //vaultCraft OptionsToken
    "0xa199409F99bDBD998Ae1ef4FdaA58b356370837d": {
      taskId: "0x65cc78525a58054d910b2b72",
    },
  },
  5: {
    "0x40A50cf069e992AA4536211B23F286eF88752187": {
      taskId: "0x64b6f61abd8d6c1556063bb2",
    },
  },
  10: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
  },
  56: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
  },
  100: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
    "0x9008D19f58AAbD9eD0D60971565AA8510560ab41": {
      taskId: "0x64b6f61abd8d6c1556063bb1",
    },
    "0x40A50cf069e992AA4536211B23F286eF88752187": {
      taskId: "0x64b6f61abd8d6c1556063bb2",
    },
    "0x22C1f6050E56d2876009903609a2cC3fEf83B415": {
      taskId: "0x64b6f61abd8d6c1556063bb4",
    },
  },
  137: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
    "0xDef1C0ded9bec7F1a1670819833240f027b25EfF": {
      taskId: "0x64b6f61abd8d6c1556063bb5",
    },
    "0xe47085AaA1dc8122f5A1f623068967b3bc92782c": {
      taskId: "0x64b6f61abd8d6c1556063bb9",
    },

    "0x6FF1B62B8a6020A19451d00c21EF8B875d174E91": {
      taskId: "0x65d069538adbd9f63605faa1",
    },

    // quickSwap AugustusSwapper
    "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57": {
      taskId: "0x65d069538adbd9f63605faa2",
    },
    // quickSwap LP
    // steer
    "0x29E1888F7DD0757f2873E494463Ec389dab38D27": {
      taskId: "0x65d069538adbd9f63605faa3",
    },
    // gamma
    "0xA42d55074869491D60Ac05490376B74cF19B00e6": {
      taskId: "0x65fd426b76268e470a05307d",
    },
    // manual
    "0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6": {
      taskId: "0x65fd426b76268e470a05307c",
    },
    // v2
    "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff": {
      taskId: "0x65fd426b76268e470a05307e",
    },
    // single token
    "0xDB8E25D78483D13781622A40e69a9E39A4b590B6": {
      taskId: "0x65fd426b76268e470a05307f",
    },
    // quickSwap stake
    "0x958d208Cdf087843e9AD98d23823d32E17d723A1": {
      taskId: "0x65d069538adbd9f63605faa4",
    },
    // quickSwap Bonds
    "0x133141571DC83783d7c05138af8aA9cc2189c1A7": {
      taskId: "0x65d069538adbd9f63605faa5",
    },
    // quickSwap ape bonds
    "0xcbf5A78AA5cAb66779355FE850884D7029Fbd4df": {
      taskId: "0x65feddbc86e7f1cbc0049593",
    },
    "0x4fbEc51bFB4Fad1D431608d8CAfDe3Bc48c64F8A": {
      taskId: "0x65feddbc86e7f1cbc0049593",
    },
    "0x39D66fE579130B26Fed64187C0BA7fB03079424A": {
      taskId: "0x65feddbc86e7f1cbc0049593",
    },
    "0xd9828D048E35f0B5B3eDdd4759D5b2B769d8cB7b": {
      taskId: "0x65feddbc86e7f1cbc0049593",
    },
    "0xff4c72eE74916Ce8FA81FFf0DFFa8a32288E31E9": {
      taskId: "0x65feddbc86e7f1cbc0049593",
    },
  },
  324: {
    "0x18381c0f738146Fb694DE18D1106BdE2BE040Fa4": {
      taskId: "0x65dc96f1fb5fbdd09c0fef7e",
    },
  },
  5000: {
    // reax lend
    "0x5069736565cdBdff640328a59541C3854C331192": {
      taskId: "0x64b6f61abd8d6c1556063cc0",
    },
    "0x4bbea708F4e48eB0BB15E0041611d27c3c8638Cf": {
      taskId: "0x64b6f61abd8d6c1556063cc0",
    },
    "0x20127Cd9fD513c69962106b51b7996d73786BD6f": {
      taskId: "0x64b6f61abd8d6c1556063cc5",
    },
    "0xcD42a8B99239D4a806DF4E340f2373bABaDC6a72": {
      taskId: "0x64b6f61abd8d6c1556063cc5",
    },
    "0x9C31d48De0B5B47FF52F637c526687dd06CA8431": {
      taskId: "0x64b6f61abd8d6c1556063cc5",
    },
    // reax vault
    "0x1AA7f1f5b51fe22478e683466232B5C8fc49407f": {
      taskId: "0x64b6f61abd8d6c1556063cc1",
    },
    // reax stake redirect
    "0x6488d552b47F6BAa4c1Efd46CE740aAf6Ed4c2CC": {
      taskId: "0x64b6f61abd8d6c1556063cc2",
    },
    // reax swap redirect
    "0xe1FFC470a1dAFDF9aFB6627Cc3816F35fE09D09E": {
      taskId: "0x64b6f61abd8d6c1556063cc3",
    },
    // mint synth
    "0x78B2fa94A94bF3E96fcF9CE965bed55bE49FA9E7": {
      taskId: "0x64b6f61abd8d6c1556063cc4",
    },
  },
  8453: {
    "0xF6b3BC10aC4e6511d9fF7d213e1de182d4862862": {
      taskId: "0x6572b847a6c850af7e0a4c58",
    },
    "0xE0EbE07CDb7cE3671cE9D3fF899940864c83b38e": {
      taskId: "0x6572b847a6c850af7e0a4c59",
    },
  },
  42161: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
  },
  43114: {
    "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE": {
      taskId: "0x64b6f61abd8d6c1556063bb0",
    },
  },
  80085: {
    // bera chain swap, lp
    "0x0d5862FDbdd12490f9b4De54c236cff63B038074": {
      taskId: "0x65e5fa71c59bedad3d0458c4",
    },
  },

  // scroll swaps
  534352: {
    "0xFD541D0e2773a189450A70F06bC7eDd3C1DC9115": {
      taskId: "664d949d59c7e1fa9a0a37d0",
    },
    "0x80e38291e06339d10AAB483C65695D004dBD5C69": {
      taskId: "0x65e89128b27f189bde06b09a",
    },
  },
  59144: {
    "0xC2a1947d2336b2AF74d5813dC9cA6E0c3b3E8a1E": {
      taskId: "664d949d59c7e1fa9a0a37d0",
    }
  }
};

const lifiTestTxn = {
  1: ["0x315b5f37478798762c945dbf0e5a7d5b6e7bf82d9486b9019b281a7a1bd07da7"],
  10: [
    "0x2b18683ec4f8d85138c080f9511de35049f715803e48b436d54eb43b872bc96d",
    "0x4d3c3fcf99efec8b22bac3ae9110b85d0f70c52f8a93791445c36578ccd79486",
    "0x12a422629e3699be5b8a96ef8aa49d8c84fd738f29a5477f7314d2ff1c9d0115",
    "0xeb0d8395f1eb86ce1b4ab3e12f3efecd4d798baeb685b2f18024d2466e59c84b",
  ],
  56: [
    "0x1515f9b0ffc2011e5e77e48a488e7b0da0340f731c05f271ae065814151a8f92",
    "0xa2c7871d5d252503c34278972cd84ef01276e7a00f0c20a2933fc7dc9d1be222",
    "0xbe10a4acb553d0f89f7b7ad40b03c7b4b1fad007c727c5097d2481b06c031f90",
    "0xb935fcb623e06c50b690a9a4b7a4dccead4ba1272b06af47277f3fea1ec28f3c",
  ],
  100: [
    "0xd84883522cbed2768ddfd34c171de9ef028a8d5b1e3f5795f298d3574f2d38ee",
    "0xd49f736f63df534d51b76ff1fa6a4bf67934ec016f27bc66ba36ea3df8cb0908",
    "0x21d522b314fb694e53d60e34de16c9013ec6a912de953f955439d7b69020a62a",
    "0x1b252dc29a1c9a5b7a672521864fae54d94b0a58f206c06d06a08cb5e4653520",
  ],
  137: [
    "0xb57a6c20ce43554a9ecb8a47f37f347054afa13e174e5badf2fe13ccb1cc6e14",
    "0x0e2895365fb448488446cb328ce67fe911a9456f7aaf9ff1bd13b91f61adce0e",
    "0x467206508498cc0a1eb6718f130754dbee4d3e9539de2aa30290ba1d51339619",
  ],
  42161: [
    "0x9d44461ea3ed8c1fcf1df5547dcd1913d29a298dcd8ba54d196436bfd4d571cb",
    "0x3d37d6d9b89673fe9d75ca64b96760dab360996dc8725e5674f920de486f27ec",
    "0x72a45f5596fdf8d8a6fc04ed3b5200293fe00b7fca66aee05db5fd964a52dbc6",
    "0x0d06115dbb845fe2ec6f168568fe7dd1e0e29ca81874538c8e522257740d7d84",
  ],
  43114: [
    "0x63c01bd80398f54c281b17fde0324955576f3599535b8f4344d5411058e90785",
    "0xf01dcbb5eca6fa7225110969ff4aaf8213bcd6056b82927368549f8755cb2a44",
    "0x3858dcf30d369951f489a4300b6edd0de9515a0cdddf5d0096690581d6b9a682",
    "0xa589bbaa36160d003749a2e60b65fa1785aaf202502859f2b96cc6e2fb26def4",
    "0x52b4c4fdf25dd4b6b1a20c2c593880d4f2329fdc0386fd8719021e96ee2afb6b",
    "0xbce2da78f6fef95749e12af2f61c5e56908a5b58aa1d6556db9ce985dcbaf2e5",
    "0x46aa47bf6238add0be44cd23e06ed9258ed90ba32077cd8cd977406914c0fc18",
  ],
};

const cowswapGpV2SettlementTxn = {
  1: [
    "0xf7db6342b71c75f366428299ca6bbc4b7e496adff4af4774a5e9c571cb8612c3",
    "0x596bc51861a729ed4f031fb02329a141f79a2bbc2fb4b92c780da65bca28bc50",
  ],
  100: [
    "0xbe36ef2ac44d4feac540d9aadfd888d54fbda055a296755a5f51cb781b8a89a3",
    "0x8a0e3bd0fc68fd44bc593aa8f0150324f8b30ec4bd9544a8f30c3045c2f913e0",
    "0x3beebc4e2273f1bba4586b6cc965384b09ca4c43759c18fe68c4bb9f4793c770",
    ,
  ],
};

const cowswapEthFlowTxn = {
  1: ["0x74eab8d074b0b20c3f24ca5589f389c6b32829eba21625fe40f59010f6734a59"],
  100: ["0x61ed61175c331c304ca34c81e678bc7646ef1e8bef276eab799cdcee287ee735"],
};

const zeroXTxn = {
  1: [
    // "0x60ecdc3ff51bcb3599fc4e1111a81d136f093237d293a45ce92c6318a1dfcad5",
    // "0xe3b19bd036e0c60e3a7dd6cacff635dfb9f7ce940413e3b7ab9f274a238febbd",
    // "0xec3b75faf33591f4fa8b9c73cd17a87361d4df413fce6a14668b6a8f1627cc15",
    // "0x59a3dd4703cc16746bb664c5596f3b7830b767a68bf39b4af8eaa61961b4583c",
    // "0x2a10b974f2c35fab9081ade22e0d6ffac40cf69908d8b1ded0c948de970c77d3",
    // "0xc8cf8e94f236ac37aeae3a4ba58f4db27d2f135f235f0108f97ddbef7b4d8d07",
    // "0x6c1e94e8d7c5ec7f67b8a82b156f2e0a510d477dd20681bd3279e6c9e14572be",
    // "0x086476c78b679a0346a565e7f5ba402eb3f999b583d22c6646b79482a83c1a6c",
    // "0x3845d29ea591900fa3be1f288acb2e98c76fa3f20310e1b70c55b4468ecc9c10",
    // "0xb5ba81b89cdaeff53510b45010f8bc8983b5f95b3f0f4ee60454dde02a122c43",
    // "0x27ca8c099ccd911dc6efa6ce9f31925b2e792c083d556267081129405177b1b5",
    // "0x7bd2abede880585ccfa6ca07b61f4feab9e979023450d13fbeafd20a22af9a26",
    // "0x6f4175842deb8da8c33d7a46571b7cc4cd7f94ed72c3f0f42f95139f3208b3b3",
    // "0x73944a506a1395e827dcd3ec95d9362e3a56c3429c06e28ccacb64806494e6d9",
    // "0x0fefe60b96bd5f29d6ea6b9669a5b8e71257b68f33a03c6ab17950b6419e7376",
    // "0x18977fb86457242cff9766acffc6472c3d495822f0bb5558adc780325252f3d3",
  ],
  137: ["0x95f8a9d46e3e612f3fdaf43d5bb08ded3004c85d9896fa0c957b70d0a4c3a4bd"],
};

const oneInchTxn = {
  1: [
    "0x3fe6d71143fc82dcc0945756e6e49d64cd3a1c880e2589886329df4e2f7832f2",
    // "0x667ab028d537609743f81b5d9975e112f794cc76b8d04f28c5538b7f348abd7d",
    // "0xaed2605d0e3866505a2fe1514c056e21bc5bf1e095615e561a2d7354dfd83c27",
    // "0xcf16ddfae48666ff1681445166f762bcef2060a4aeea0e761ec20bfbc2f43280",
    // "0x0bce79379aaa745e4857357bc4b56d740f721cf106609f72f682acb73a39b56c",
    // "0x133c6d28ee1d7a6c47736568dfa54849e653d82ca1b2e1d44747a049f5a73044",
    // "0xe6634d6ae428046bcb5bb43d622ef6c1af0ad4f0837dc06a1e58a3c159689c17",
    // "0x133c6d28ee1d7a6c47736568dfa54849e653d82ca1b2e1d44747a049f5a73044",
  ],
};

const shapeshiftIdleFinCdoTxn = {
  1: [
    "0xddfaa5ce7092e886d4394c93b4a6d43f603d0732c54ab7aebe33fca268f8c626",
    // "0xd9018752ed390be765cb89e3e2abe508a27205ddd6477ccd520be13c9eec4652",
    // "0xdfcd6ca34bc03b379aeb37ab3c330dedff0ede4464974e99ad4e4c8308fdb951",
    // "0x9a6a6a773ea22eb538b04ead645af66276c86a390e200f822092e19bdf91b794",
    // "0x75ef1ebff584bb5dee8bfa1a2b97277bf22c10d46aac29a528b1d7aa70af1516",
    // "0xc4963e0941f420252dee9ff1c03b309e3c3d2859c4909e349ea58c866e0cd9fc",
  ],
};

const idleTokenTxn = {
  1: [
    "0xdbfa15918127959f92ff3df2aa7b68502c172d9db0d2378e1b36e466e1df0cb9",
    "0xed262cb9697c98c563562c42140e2ca1a9a231bd8a35c00c500b0de3e21d78a7",
  ],
};

const splitProtocolTxn = {
  137: ["0x119b6240c1db78b8c7f38659233a6bf8ff252197c119f38bc7adf120eaeb6fce"],
};

const reaxTxn = {
  5000: [
    "0xf0f8c0464604e6b418f3db1b00baef5b9f8ee74d2db284bdf08a8b40b2591769",
    // "0xc95a888f533e3e6628cb5d3fa1ff4c2f43fdda443a92ee118b9d05e43cedf5d1",
    // "0x6a63f89e0b3a4c77f5af0b50dad05acafd99df5e68e31a23d8789a29ba9bf115",
    // "0xdb758458b67270fb36f06f47e839b4f8293d490465ef667281e303447324598a",
    // "0x1e9dc52e4b41f48c83f514b4ec3b65d20350f036bfe215ffae3585e8ff2f4f29",
    // "0xdc93d301d07eaf657174a57abba40401d00917c9c298f5020bb2766d2ec4deba",
    // "0xed34baf0b008dd40bbca1424a10fbebdc1b2a68a881095d6cf85d44dff2378e6",
    // "0x741c9a651c22ca61d1601b09c9804c267a99ebc941845c8c8d0f54ce435af757",
    // "0x7d4e67feb505f75c7b983d0f30693be6505f6b6225c8f62c5569224192c867d3",
    // "0xb3a5ee72fa03e801b6f660c4ada1b5c70885277a64fae9f2864667b6324b796f",
  ],
};

const fxdxTxn = {
  8453: [
    "0x508eafc2c27e15c6ae1a65f9e1b2369d5f2cfb4610362d8a63e3dda109f6b660",
    "0xcf7ade7cb0c88ea2562bc92e1f63be9c3220291fb50b55cb51f07483035fe410",
    "0xb6d57524944f3f097f7d2bb5d9bf96cf39314147fff3cc09e4667323b4bb149b",
    "0x84dd2d735a6e12e96caa29a93bdba1db1ae9e2255f1a157bb4ac79b892a3aeeb",
    "0xa52e767e99537203654c10ca9af43616a52e4912e4bebf73cd15d06745bad693",
  ],
};

const blastTxn = {
  1: [
    "0x795690e86505e109f6ead51cad0e9ee2a1df48c93649818580610ac83e46ebf0",
    "0x63ec4e793882000a8a4565d0b324c967b2f8e872e886ab95ea560ef1a1a90122",
    "0x8aaacd4a2c3beff8ff2e4f2b9a30e34490681cb97402bae65727cdaa19a028b6",
  ],
};

const loonscapeTxn = {
  137: ["0x0745b20bc2ec5d426f09c17f811742e12bae2f5b26ab1415c95c5503daeebdff"],
};

const zksyncTxn = {
  324: [
    "0x189206f5c2c7cbbfee2364e97488f0db42327a0f7b8df719dfa930271f37eb7c",
    "0xd556332872df891037a99608fbdfef66cffe6982c33979a4f0a715e87e37a715",
  ],
};

const berachainTxn = {
  80085: [
    // swap
    "0x09c1e70b7dac54187f22c42365c91eda464ae1631bb9cfc91b1cdd84e436ea9c",
    // add liquidity
    "0xa801168339b14db1ce79baf96775945fb4d3e016488de4a32da12e8de397b891",
  ],
};

const yatNftTxn = {
  1: [
    "0x2c03f07ea63f367135b84c7dbefb405a35527fc65f7fc8f43fe8efc594a4bd04",
    "0x2e5d3d3ea53d5541c32dd4cac84498f22fa38f4a1822b5e052aa8305eba96984",
  ],
};

const poapTxn = {
  100: [
    "0x5eee0a31196a3c29832263dab74bcfa794e6db2549ac0bd8739dce2a5480b5db",
    "0xe5cb8d88d512fc3ae52364b63680560ab76a44f0d85864d64e812b9c362322aa",
    "0x8d1c262e8c714f4e32f918a1d24d4ee3b46176bea9577acb3b2593e841a0fcd8",
  ],
};

const erc20TransferEventTxn = {
  421614: ["0x0df2b8918cb1307c4a2cc0acb28d5370df4140f9492ab4873f3204a16f0d84e9"],
};

const mercleNftMintEventTxn = {
  534352: [
    "0xe57b55605d74fdb2a7272a366b0cf2c046b98f9221c375dc260c8a1dce9f3299",
    "0xce26fd60d44cc167e8e227d87bda2bbd37b1cb43a98130e2128c314c369a68b4",
    "0x0d493adbdc9dede202a0ba396061b8914b7690b70c00a4cc37ddc7e3354af7af",
  ],
};

const erc20TransferEvent = {
  1: ["19581713"],
};

const sentimentWithdrawDepositEvent = {
  421614: ["27934923", "23586009"],
};

const quickSwapTxn = {
  137: [
    "0x33246139c13a7802c137a64b194066414976b8d359a60c1fd029d5f942565b71",
    "0xd985bebd98427b1546b4f7ae4d7faea4ed3f26262f16044e086fa0ad29d2aab3",
    "0xf21211b5ba76198b96737b05dd2fe472c7c926fc82477cff17526b9e81a29b51",
    "0x8f492130e40439c2e955f011bff3cd10a19d59d4435836e021dfdefa004f04c9",
  ],
};

const quickSwapLpTxn = {
  137: [
    // steer
    "0xd6b7c885a37c49284ad1b0890449abd3399a3738438e238df2b4e46a6d5dd6dd",
    "0xc3f402ec9366609f6ce75bb87f11f66ef9b94921b99b0791072c7630d8ba35b8",
    "0x8f3c39c98d24a79065f1e458b04ee7738f49872a7df505ea0b70acde087ddb7e",
    "0xb2965a0f173fef39239e2b670f06743856b082b5edae713eee3edfe84088e9c1",
    // manual
    "0x5b547704c0648d45e9349b1847a56af3a3e2c94dbcea8368350706fbb2373067",
    "0x096490e242199f74fbfac9ac11efd8868dee0c0f4462b705efd510791846db6b",
    "0x4a35e9eb2827bba5a4d9d23d26e1c582583d006a86ff86f612c4d9ae19d61c05",
    "0x09e82f98f911cce2b06b57f751eba0fb15ea039bd128f725a0725e56c1ded9c9",
    "0x3011e735b579ca5ba7b268d8dc2dae2937110969731f0a6e11cd397c2713f4a1",
    "0xd8d689b2d828fdf1da48e21b1719ac263b82952f05c6523c734006ed2e37451a",
    "0xfd9e7c45fcf8262e2ac8b369ca325870f0d168a140a44704ffdddb9bdcea9bef",
    "0x7e96502522eee92dbd97732c1b890f46ab199801007262a62ece83dfdfe9769e",
    // gamma
    "0x8b0023cb09658695f1e33445ccacffbe540750fad2b5983542745d565e6d1e39",
    "0x0f2cd7a048065aa87e58f73a83c52232d6e57530f7aa623b46afd10ef43478d7",
    "0xe9e2a112885353c5cb99b4a718d949087e4933d03fc7527bef5c5ba246f0a180",
    "0x64c2fd16cf148f26298073fc160687ae3d58315028ffe7c75067e637168d7b47",
    "0x9367ac6c212afbb082f504af3395653c2ac4f2a23db1a8d0ee9878c1739065d3",
    "0xa8058b5a960a4dc1aa2778923e6a64d2487c17baea1cf2dc9a5d9e6312f15b3a",
    "0x4cd34d91a0e58edd2bd736b956ce2b720ee945be014d0b2a2b4ec6e14fb727bf",
    // uniswap v2
    "0xab33a31a6777ac5b6f95e173d07df377d6a0cd7f940d36620ed4692ce7563a76",
    "0xdc5eee9fef74db888a383668bbe8c491d4217cb165bbee15bdd4330dffab7ee7",
    "0x96a4000641dadf7d5d68d05bf8d85c7cb34309b922a5c6e677030e8510060594",
    "0xab33a31a6777ac5b6f95e173d07df377d6a0cd7f940d36620ed4692ce7563a76",
    "0xa80f6ac01d6de16eb1c99705ee92c7a2ae9aca0d8fa801326b6bfca6baeda2d5",
    "0xb180a2ef8b185100a71e6c08bd2159081738ed4d80e2136be290ef405487e17c",
    // single token
    "0x7f0ef186e8893c4fe216261d7fa264b67126725e6b847fd6c7ddace3bebd886d",
    "0xc8bee6c2e208e98ec998f3a7e4100e64194be72336d8910d04b857d401eb93c7",
    "0x2ae4f100f59b8c276ce6af328b2be1b12fae0b5f385c9d2fb5d44a13652f5c68",
  ],
};

const quickSwapStakeTxn = {
  137: [
    "0x6bc9071569894d3c02d98078a733ac0cfdf9d68f8701d27e1e45d9a01ad9e34a",
    "0x24575aaf29492ba00c82b1512ed0895ff8ec1a1cfdd3594f8e58516e122cc5f3",
    "0x9870230ed1edcd144583e719bd740a77615d770b91bc7a9477b510f80bc1843e",
    "0x91b9ad8e6b52c8006717a9a6652fd89f2f09c9c4cdd3a71df4985c6071d5aa6a",
  ],
};
const quickSwapBondTxn = {
  137: [
    // "0xe22b4dbce24093e73d07b27de95a19791d728eda94b6466c016d8d89c62d2027",
    // "0xdd6bf454daa11e3c046182b394daa6e087a9922af03597b58346b9d93b5cac3f",
    // "0x11a5305b78cf79b2c18082c566fcf552502f8d9b242f5013c3f4bda48e988692",
    // "0x48886ffba331d34e672fd025bdd8372839c3cfff82160260909b0ca33809faf5",

    // lp for bond
    // "0x10eed85921bd73cbd01fd01ecaa436c17efea5b22994ab805417325e25cca6c9",
    // "0x8033a8decf9363e13c81d1ac49d59fe6377457b211eecc367e4e98fdc966b7f7",

    // ape bond
    "0x0c046fedf15579d7fa760cf9fa9da45151adf38c5b943d87ac0d85e592d005a4",
    "0x1c34fc57fc4c668ac1aa10ee197fd24044fe1ca87741cbf84dad2c83f4a4c3d1",
    "0xa33b3d7b81c86a633a029cf783e9097740cc2d8092b8c33019e2267824a2c747",
    "0x65a204aea9e66eba00851343dc2f42ab9ebc0c80536cfb65a141a9112d7e0cde",
    "0xeb17b4d91901a42d7faf061963e3cce4479417d4458871ded5a8ad30cc39f678",
  ],
};

const scrollTxn = {
  534352: [
    // addLiquidity2
    "0xc8e57e52359015b578774b6c13caf5f46a9b424d9891b0e84b1577ace4dbd537",
    // addLiquidityWithPermit2
    "0xd5cde5af55d412e2bdbb4f73ba1b71b4e0947156ef682c38f9111aecb2187e06",
    "0xa120c781b1e7818b854da6a31d81c67d7d11984519a8d02611aa7bfbfe86fc98",
    "0xf36d7afe9eec31f08c597ecb172959bb27628be61e4e7cf137e746355809c033"
    // "0xf8d9cfbae3ba3c269f834c96933460ce74171a4e3f8c250928747f6d4f320be1",
    // // swap
    // "0x5c156eac87f8101b9ace12cd8eef140d247356c79b3bd4fc2a3ee5e3e705b163",
    // "0x7d70b1cf710f5796ba6240fa53f1358d419c0f12215b228b7ce2297008197d9f",
    // // swap with permit
    // "0x65d170d2fb27bec47a331a21105849ff9b7cde4c320b538dc0c35fb866da2274",
    // "0xa20a689e727cbe8e7e3ef6f18f88120630eb3012bf8f4ffc9e28fb686951d1c7",
  ],
};

const lineaTxn = {
  59144: [
    "0x5123c777c895352a5c5eae9056ff66a77f0f80b903f8fb10af75805d3a051f97"
  ]
}

//LP and Buy uses the same parser file with different parsed function
const vaultCraftLpTxn = {
  1: [
    "0xc3e126568bd2f83d89fe1cf09d2e512633ba710842098eafd6eb394e8ca15867",
    "0xcb86b1cc66d71cae3b3004b1ad9a8b95ebf91d1660825466c80633782a3c64de",
    "0xcb86b1cc66d71cae3b3004b1ad9a8b95ebf91d1660825466c80633782a3c64de",
    "0x112dc3686dc23529721f9ea6523ab2658b4d27d182bcd22431c486b291599656",
  ],
};
//LP and Buy uses the same parser file with different parsed function
const vaultCraftbuyTxn = {
  1: [
    "0xa636c6bbaf36c491b8a2a6595a9eee331be421a98845b19a99e3c16431faa53f",
    "0x4b2712e9e717cc8feafbf2a5312e29c45eb3ba5cf77a157d97c2e6e57ad04ca9",
    "0xd198e2aa03cfe15e747bebd971a8ff383563b82079f71170412026980edbae90",
    "0x88bece519cf836584804d329bea966ea7cab921c0048698658893c03b7e8ebae",
  ],
};

const vaultCraftStakeTxn = {
  1: [
    "0xb9899c3963f12c96961c94c4462e7292d1c0f0ae4a739fe208b6be8f0f6c9860",
    "0x6e411d0e93bffccb17b326af33ce8eabdb63b0f6665e5e5787a9a7a00bcc21e2",
    "0x264115dd893d57d1f983ce7dc428146e7c9ab858f8c354e89385743e0dc8131d",
    "0x40206cf65eb9a96841e5024cf51db664ea8ba02f8e03032a0f77581cd30ba681",
  ],
};

const vaultCraftMintveVCXTxn = {
  1: [
    "0xdfaf3e12848728f2368fcd643adf1b38cd34947604b8d6d60118fcec99131931",
    "0x4da323c0c1e0f38d90f149eb18fa3804f0bca2a8aeea41b673b86782db7b5398",
    "0x08a8ea07461f4f441944c3758fb95062c9a3ede44868c0589e0ad391d43831a0",
    "0xbb7ab61c9ab03a800551cc62f37bdc30e19fa164447f3e8d86444f5a81e8d9db",
  ],
};

const vaultCraftExerciseTxn = {
  1: [
    "0x12dc18f94f8a953128c2f20be7d6b7a5658844c1af0460d2169790974256af56",
    "0xb79e8bd3e74c3ed58c74f1052daca7ba71f3593eaa0747dd2354b95f451b3a06",
    "0x743c5e3c98d7f4b3f12585275af889f9ddcbc797e09d9c9dc912782399b8f806",
    "0x9f2ccc83d3773dd22babfbef9a17ba90611c97dc93e3b8a47e6c00db05e6ddf4",
  ],
};
const vaultCraftCreateVaultTxn = {
  1: [
    "0x242d7a60885e55cae7e2ae64717b91dd326ca1db1447e938d0d512da280d8183",
    "0xef7f9ec600b6914dabcba3c89723db5a8be9120398e2bcd4db5e1cd5cbc991b0",
    "0x36c7b736a472ddd931669646549b11c2c20ae66e0663ddffbda6d996f806bad8",
    "0xe3bfdc59f77ce167e1b5d07b63cdba6b1e651e07d5dae348c7c8c23c564e6787",
  ],
};

module.exports = {
  task,
  trackTxns,
  lifiTestTxn,
  cowswapGpV2SettlementTxn,
  cowswapEthFlowTxn,
  zeroXTxn,
  oneInchTxn,
  shapeshiftIdleFinCdoTxn,
  idleTokenTxn,
  splitProtocolTxn,
  reaxTxn,
  fxdxTxn,
  blastTxn,
  loonscapeTxn,
  zksyncTxn,
  berachainTxn,

  yatNftTxn,
  poapTxn,

  trackEvents,
  erc20TransferEventTxn,
  mercleNftMintEventTxn,
  erc20TransferEvent,
  sentimentWithdrawDepositEvent,

  quickSwapTxn,
  quickSwapLpTxn,
  quickSwapStakeTxn,
  quickSwapBondTxn,

  scrollTxn,
  lineaTxn,

  vaultCraftLpTxn,
  vaultCraftStakeTxn,
  vaultCraftbuyTxn,
  vaultCraftMintveVCXTxn,
  vaultCraftExerciseTxn,
  vaultCraftCreateVaultTxn,
};
