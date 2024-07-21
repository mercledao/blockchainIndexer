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
        headers: {
            'content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    return await response.json();
};

const postOldBlockToDiscord = async (message) => {
    console.log('message', message);
    await fetch(
        'https://discord.com/api/webhooks/1264512157819863100/vUF02OEeQod7TKc7OMZ9HjChzFMjs9vDiWn0TH87Y4Ijfbv-h6_VJli0PTeH-5gS6LR3',
        {
            method: 'POST',
            headers: {
                'content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'Indexer', avatar_url: '', content: message }),
        },
    );
};

module.exports = { get, post, postRaw, postOldBlockToDiscord };
