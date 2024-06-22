const { db } = require("../mongoHelper");
const { post } = require("../network");
const utils = require("../utils");

/**
 * task = {
 *  ...
 *  webhook: {
 *    url: "some backend post api",
 *    config: { // optional
 *       headers: {...} // optional
 *       body: {...} //optional
 *    }
 *  }
 * }
 */
const callWebhook = async ({ task, payload, contractDetails }) => {
  if (!task?.webhook?.url) return;
  /**
   * The webhook api must be a post call
   * call webhook api
   * dont retry. save failed calls to db.
   * servers will call the the fetch failed calls to get all of the data and then process it themselves.
   */

  post(task.webhook.url, payload, task.webhook.config, contractDetails?.webhook?.config).catch((e) => {
    console.error(`webhook post failed::${task?.abi}::${task?.eventName}::${task?.webhook?.url} => saving to db`, e);
    const hashId = utils.hashObject({ task, payload, contractDetails });
    db.webhookFailedCalls
      .insertOne({ hashId, task, payload, contractDetails })
      .catch((e) =>
        console.error(
          "couldn't save webhook webhookFailedCalls:: possible duplicate",
          hashId,
          task,
          payload,
          contractDetails,
          e
        )
      );
  });
};

module.exports = { callWebhook };
