exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const params = event.queryStringParameters;
    const url = params ? params.url : null;

    if (!url) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: 'URL parameter is required'
            })
        };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WebsiteMonitor/1.0)'
            }
        });

        clearTimeout(timeout);

        if (response.ok || response.status < 500) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'ok',
                    statusCode: response.status,
                    url: url
                })
            };
        } else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    statusCode: response.status,
                    url: url
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: error.message,
                url: url
            })
        };
    }
};