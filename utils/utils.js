function resourceResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*', //enable CORS
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,authorizationToken,X-Api-Key,X-Amz-Security-Token', //added headers for lambda authorizer token
            // 'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}

module.exports = { resourceResponse }