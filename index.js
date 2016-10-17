
var AWS = require('aws-sdk');
require('node-env-file')('.env');

exports.handler = function(event, context) {
    console.log('Lambda Event: %j', event);
    console.log('Sites: ', process.env.SITES);
    console.log('Types: ', process.env.TYPES);
};