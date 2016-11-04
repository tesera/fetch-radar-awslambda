#!/usr/bin/env node
const lambda = require('../index');

process.env.TYPES = 'PRECIPET_SNOW_WEATHEROFFICE,PRECIP_RAIN_WEATHEROFFICE';
process.env.SITES = 'WUJ,XSM';

var scheduledEvent = {
    "account": "123456789012",
    "region": "us-east-1",
    "detail": {},
    "detail-type": "Scheduled Event",
    "source": "aws.events",
    "time": "2013-10-17T00:00:00Z",
    "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
    "resources": [
        "arn:aws:events:us-east-1:123456789012:rule/my-schedule"
    ]
};;

lambda.handler(scheduledEvent).then(console.log);
