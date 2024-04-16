//for runtime node js 16.x

// const { verify } = require('jsonwebtoken');
const { getProduct, getAllProducts, createProduct, deleteProduct, editProduct, updateProduct } = require('./controller/inventoryController')
const { register, login, verify } = require('./controller/userController')
const { resourceResponse } = require('./utils/utils')
const productPath = '/product';
const allProductsPath = '/products';
const userPath = '/user'
const userLogin = '/login'
const userRegister = '/register'
const userVerify = '/verify'

exports.handler = async (event) => {
  let response;
  switch (true) {
    //product inventory routes
    case event.httpMethod === 'GET' && event.path === allProductsPath:
      response = await getAllProducts();
      break;
    case event.httpMethod === 'GET' && event.path === productPath:
      response = await getProduct(event.queryStringParameters.productId);
      break;
    case event.httpMethod === 'POST' && event.path === productPath:
      response = await createProduct(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PATCH' && event.path === productPath:
      const requestBody = JSON.parse(event.body);
      // response = await editProduct(requestBody.productId, requestBody.updateKey, requestBody.updateValue);
      response = await editProduct(requestBody, requestBody.updateKey, requestBody.updateValue);
      break;
    case event.httpMethod === 'PUT' && event.path === productPath:
      // return resourceResponse(200, 'Put');
      response = await updateProduct(JSON.parse(event.body));
      break;
    case event.httpMethod === 'DELETE' && event.path === productPath:
      response = await deleteProduct(JSON.parse(event.body).productId);
      break;

    //users routes
    case event.httpMethod === 'POST' && event.path === userPath + userLogin:
      const loginBody = JSON.parse(event.body);
      response = await login(loginBody);
      break;
    case event.httpMethod === 'POST' && event.path === userPath + userRegister:
      const registerBody = JSON.parse(event.body);
      response = await register(registerBody);
      break;
    case event.httpMethod === 'POST' && event.path === userPath + userVerify:
      const verifyBody = JSON.parse(event.body);
      response = await verify(verifyBody);
      break;
    default:
      response = resourceResponse(404, '404 Not Found.');
  }
  return response;
}