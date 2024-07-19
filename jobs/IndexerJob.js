const blockProducer = require('../helpers/indexer/blockProducer');
const blockConsumer = require('../helpers/indexer/blockConsumer');

const init = async () => {
    if (process.env.ENV.endsWith('_jobs')) {
        await blockProducer.init();
    }
    await blockConsumer.init();
};

module.exports = { init };
