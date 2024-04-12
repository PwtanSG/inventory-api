const { resourceResponse } = require('./../utils/utils')
const { generateToken, verifyToken } = require('./../utils/auth')
const bcrypt = require('bcryptjs');

const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'inventory-users';

async function register(userInfo) {
    const name = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username;
    const password = userInfo.password;
    if (!username || !name || !email || !password) {
        return resourceResponse(401, {
            message: 'All fields are required'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if (dynamoUser && dynamoUser.username) {
        return resourceResponse(401, {
            message: 'username already exists in our database. please choose a different username'
        })
    }

    const encryptedPW = bcrypt.hashSync(password.trim(), 10);
    const user = {
        name: name,
        email: email,
        username: username.toLowerCase().trim(),
        password: encryptedPW
    }

    const saveUserResponse = await saveUser(user);
    if (!saveUserResponse) {
        return resourceResponse(503, { message: 'Server Error. Please try again later.' });
    }

    return resourceResponse(200, { username: username });
}


async function login(user) {
    const username = user.username;
    const password = user.password;
    if (!user || !username || !password) {
        return resourceResponse(401, {
            message: 'username and password are required'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if (!dynamoUser || !dynamoUser.username) {
        return resourceResponse(403, { message: 'Incorrect Login credentials.' });
    }

    if (!bcrypt.compareSync(password, dynamoUser.password)) {
        return resourceResponse(403, { message: 'Incorrect login credentials.' });
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }
    const token = generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }
    return resourceResponse(200, response);
}

function verify(requestBody) {
    if (!requestBody.user || !requestBody.user.username || !requestBody.token) {
        return resourceResponse(401, {
            verified: false,
            message: 'incorrect request body'
        })
    }

    const user = requestBody.user;
    const token = requestBody.token;
    const verification = verifyToken(user.username, token);
    if (!verification.verified) {
        return resourceResponse(401, verification);
    }

    return resourceResponse(200, {
        verified: true,
        message: 'success',
        user: user,
        token: token
    })
}

async function getUser(username) {
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response => {
        return response.Item;
    }, error => {
        console.error('There is an error getting user: ', error);
    })
}

async function saveUser(user) {
    const params = {
        TableName: userTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error('There is an error saving user: ', error)
    });
}

module.exports = {
    register,
    login,
    verify
}