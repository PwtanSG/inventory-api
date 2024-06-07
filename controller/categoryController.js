const { resourceResponse } = require('./../utils/utils')
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'inventory-category';

async function getAllCategories() {
    const params = {
        TableName: dynamodbTableName
    }
    const categories = await scanDynamoRecords(params, []);
    const body = {
        items: categories
    }
    return resourceResponse(200, body);
}

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch (error) {
        console.error('Get records: ', error);
    }
}

module.exports = {
    getAllCategories
}