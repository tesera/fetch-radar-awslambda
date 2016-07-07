# fetch-radar-awslambda

AWS Lambda function to fetch radar images periodically from weather.gc.ca

## Install

1. Create a lambda function through the AWS Console.
2. Configure the lambda function to run daily.
3. Run the deploy script in this repository: `./deploy.sh`

Thats it! The lambda function will now run daily and grab the last 24 URLs. It does not yet actually download the images to AWS S3.
