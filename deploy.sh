#!/bin/sh

zip -r function.zip radar.py

aws lambda update-function-code \
--function-name fetch-radar \
--zip-file fileb://function.zip

rm function.zip
