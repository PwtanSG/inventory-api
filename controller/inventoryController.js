const { resourceResponse } = require('./../utils/utils')
const limitRecords = 50;
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'product-inventory';

function validateProductId(requestBody) {
    if (!("productId" in requestBody)) {
        return false;
    }

    if (isEmpty(requestBody['productId'])) {
        return false;
    }

    if (isNaN(requestBody['productId'])) {
        return false;
    }

    if (!isNumeric(parseInt(requestBody['productId']))) {
        return false;
    }
    return true;
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

function isEmpty(str) {
    return (!str || str.trim().length === 0);
}

async function getProduct(productId) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': productId
        }
    }
    return await dynamodb.get(params).promise().then((response) => {
        return resourceResponse(200, response.Item);
    }, (error) => {
        console.error('Error Get Product : ', error);
    });
}

async function getAllProducts() {
    const params = {
        TableName: dynamodbTableName
    }
    const allProducts = await scanDynamoRecords(params, []);
    const body = {
        products: allProducts
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

async function createProduct(requestBody) {
    // validate product Id
    if (!validateProductId(requestBody)) {
        return resourceResponse(404, 'Error : productId required and must be numeric.');
    }

    //check if record exist
    const findRecord = await getProduct(requestBody['productId'])
    if (findRecord.body) {
        if ("productId" in JSON.parse(findRecord.body)) {
            return resourceResponse(404, 'Error : productId already exist.');
        }
    }

    //check if record exist
    const findAllRecords = await getAllProducts();
    // return resourceResponse('200', findAllRecords);
    if (findAllRecords.body) {
        const productList = JSON.parse(findAllRecords.body);
        if (productList.products.length > limitRecords) {
            return resourceResponse(200, 'Error : Exceed limits.');
        }
    }

    const params = {
        TableName: dynamodbTableName,
        Item: requestBody
    }
    return await dynamodb.put(params).promise().then(() => {
        const body = {
            Operation: 'CREATE',
            Message: 'SUCCESS',
            Item: requestBody
        }
        return resourceResponse(200, body);
    }, (error) => {
        console.error('Create records: ', error);
    })
}

async function updateProduct(requestBody) {
    // validate product Id
    if (!validateProductId(requestBody)) {
        return resourceResponse(404, 'Error : productId required and must be numeric.');
    }

    //check if record exist
    const findRecord = await getProduct(requestBody['productId'])
    if (!findRecord.body) {
        if ("productId" in JSON.parse(findRecord.body)) {
            return resourceResponse(404, 'Error : productId not found.');
        }
    }

    const params = {
        TableName: dynamodbTableName,
        Item: requestBody
    }
    return await dynamodb.put(params).promise().then(() => {
        const body = {
            Operation: 'UPDATE',
            Message: 'SUCCESS',
            Item: requestBody
        }
        return resourceResponse(200, body);
    }, (error) => {
        console.error('Update records: ', error);
    })
}

async function editProduct(requestBody, updateKey, updateValue) {
    if (!validateProductId(requestBody)) {
        return resourceResponse(404, 'Error : productId required and must be numeric.');
    }
    const productId = requestBody.productId;
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': productId
        },
        UpdateExpression: `set ${updateKey} = :value`,
        ExpressionAttributeValues: {
            ':value': updateValue
        },
        ReturnValues: 'UPDATED_NEW'
    }
    return await dynamodb.update(params).promise().then((response) => {
        const body = {
            Operation: 'UPDATE',
            Message: 'SUCCESS',
            UpdatedAttributes: response
        }
        return resourceResponse(200, body);
    }, (error) => {
        console.error('Edit Record: ', error);
    })
}

async function deleteProduct(productId) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': productId
        },
        ReturnValues: 'ALL_OLD'
    }
    return await dynamodb.delete(params).promise().then((response) => {
        const body = {
            Operation: 'DELETE',
            Message: 'SUCCESS',
            Item: response
        }
        return resourceResponse(200, body);
    }, (error) => {
        console.error('Delete record : ', error);
    })
}

module.exports = {
    getProduct,
    getAllProducts,
    createProduct,
    updateProduct,
    editProduct,
    deleteProduct
}