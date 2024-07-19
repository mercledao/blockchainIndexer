const fetch = require('node-fetch');

const get = async (url) => {
    return await (
        await fetch(url, {
            accept: 'application/json',
        })
    ).json();
};

/**
 * @param {requestConfig} config used to configure fetch api such as headers
 * @param {contractDetails} config used to configure fetch api such as communityId in body
 */
const post = async (url, body, requestConfig, eventTaskConfig) => {
    const config = { method: 'POST' };

    config.headers = {
        accept: '*/*',
        'content-type': 'application/json',
        ...(requestConfig?.headers || {}),
        ...(eventTaskConfig?.headers || {}),
    };
    config.body = JSON.stringify({
        data: body,
        ...(requestConfig?.body || {}),
        ...(eventTaskConfig?.body || {}),
    });

    const response = await fetch(url, config);
    if (!response.ok) throw response;
};

const postRaw = async (url, body) => {
    const response = await fetch(url, {
        method: 'POST',
        'content-Type': 'application/json',
        body: JSON.stringify(body),
    });

    return await response.json();
};

module.exports = { get, post, postRaw };
