function resourceResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' //enable CORS
        },
        body: JSON.stringify(body)
    }
}

module.exports = { resourceResponse }