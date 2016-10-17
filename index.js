
var AWS = require('aws-sdk');
require('node-env-file')('.env');

exports.handler = function(event, context) {

    bucket = process.env.BUCKET;
    sites = process.env.SITES.split(',');
    types = process.env.TYPES.split(',');

    console.log('Sites: ', sites);
    console.log('Types: ', types);
    console.log('Time:  ', event['time']);
};