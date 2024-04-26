# About this project
This node js code is the backend lambda for the api-gateway resource.
The X-api-key and jwt token is implemented in api-gateway. 

### Code to be deploy to AWS lambda
- `npm i` to install dependencies. Zip all files and node_modules folder as a zip
- Deploy the zip file to a AWS lambda function.
- Set JWT secret in lambda env var in configuration tab. (This must be the same as your apiget wayjwt authorizer's JWT_SECRET)

### API Gateway routes protected by Authorizer
### For lamda authorizer code refer to https://github.com/PwtanSG/api-gateway-lambda-jwt-authorizer
- Enable CORS in AWS API gateway recource, add 'authorizationToken' to Access-Control-Allow-Headers
- Create Authorizer in API Gateway, select the above lamda function
- Lambda event payload - Select token and set token source to 'authorizationToken'
- Goto the API resource's method to be protected. Edit Method request settings set 'Authorization' to the created authorizer. 

### token send by client's header 'authorizationToken'