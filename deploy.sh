#!/bin/sh

[ ! -f .env ] && cp sample.env .env

zip -r function.zip index.js .env node_modules

aws lambda update-function-code \
--function-name fetch-radar \
--zip-file fileb://function.zip

rm function.zip
