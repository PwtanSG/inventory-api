//for runtime node js 12.x
const limitRecords = 50;
const { getProduct, getAllProducts, createProduct, deleteProduct, editProduct, updateProduct } = require('./controller/inventoryController')
const { resourceResponse } = require('./utils/utils')
const productPath = '/product';
const allProductsPath = '/products';

exports.handler = async (event) => {
  let response;
  switch (true) {
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
    default:
      response = resourceResponse(404, '404 Not Found.');
  }
  return response;
}