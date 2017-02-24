# lambda-fetch-radar

AWS Lambda function to fetch radar images periodically from weather.gc.ca. The function should be configured to run daily (at any time), and then will visit weather.gc.ca historical imagery and download one image for each of the last 24 hours for each radar site for each image type. The images will then be pushed to AWS S3.

## Install

1. Create a lambda function through the AWS Console.
2. Configure the lambda function to run daily.
3. Copy `sample.env` to `.env` and set the target bucket name and desired sites inside.
4. Ensure you've run `npm install` recently.
5. Run the deploy script in this repository: `./deploy.sh`

## Usage

Thats it! The lambda function will now run daily and grab the last 24 URLs for each radar site for each image type. The images will be uploaded to the s3 bucket specified in the `.env` file.

## Run Manually

The radar collector can be run manually for a single date, or for a range of dates.

    # Single Date
    bin/fetch-for-date.js 2017-01-15

    # Range of Dates
    bin/fetch-for-range.sh 2016-01-01 2017-01-01

This might take awhile to run, so it is best to setup a spot instance to run this for you. This will install dependencies required to run on a fresh instance. Be sure to copy over an env file.

    sudo yum update -y; sudo yum install -y tmux git
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
    source $HOME/.nvm/nvm.sh
    git clone https://github.com/tesera/lambda-fetch-radar.git
    cd lambda-fetch-radar
    nvm install
    npm install
    cp sample.env .env
    vi .env # Copy your env parameters here
    ./bin/fetch-for-range.sh 2016-01-01 2017-01-01
