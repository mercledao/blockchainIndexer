const express = require("express");
const router = express.Router();
const indexImpl = require("./impl/indexImpl");

router.get("/", indexImpl.health);
router.get("/ping", indexImpl.pong);

router.get("/currentIndexerConfig", indexImpl.getCurrenctIndexerConfig);
router.get("/indexerConfig", indexImpl.getIndexerConfig);
router.post("/indexerConfig", indexImpl.addIndexerConfig);
router.delete("/indexerConfig", indexImpl.delIndexerConfig);

router.post("/trackOldBlocks", indexImpl.trackOldBlocks);

router.post("/webhook/reproduceFailed", indexImpl.reproduceFailedWebhook);

router.post("/cache/clearTaskConfig", indexImpl.clearTaskConfig);
router.post("/cache/clearTaskRewardConfig", indexImpl.clearTaskRewardConfig);

module.exports = router;
