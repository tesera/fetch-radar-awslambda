#!/usr/bin/env node
const lambda = require('../index');
const commandLineArgs = require('command-line-args');
const Sugar = require('sugar');
const moment = require('moment');

const options = commandLineArgs([
    { name: 'day', alias: 'd', type: String, defaultOption: true }
]);

if (! ('day' in options)) {
    console.error("Missing Argument: day");
    process.exit(2);
}

runFor = moment(Sugar.Date.create(options['day'])).format("YYYY-MM-DD")
console.log("Run for " + runFor);

var event = {
    "account": "123456789012",
    "region": "us-east-1",
    "detail": {},
    "detail-type": "Scheduled Event",
    "source": "aws.events",
    "time": `${runFor}T00:00:00Z`,
    "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
    "resources": [
        "arn:aws:events:us-east-1:123456789012:rule/my-schedule"
    ]
};

lambda.handler(event, {}, () => console.log);
