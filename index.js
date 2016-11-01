
const AWS = require('aws-sdk');
const http = require('http');
const request = require('request');

require('node-env-file')('.env');

exports.handler = function(event, context) {

    bucket = process.env.BUCKET;
    sites = process.env.SITES.split(',');

    event['time'] = new Date(event['time']);

    console.log('Sites: ', sites);
    console.log('Types: ', types);
    console.log('Time:  ', event['time']);
};

exports.getImageURLs = function(site, type, datetime) {
    var duration = 12;
    var imageListURL = `http://climate.weather.gc.ca/radar/index_e.html?site=${site}&year=${datetime.getFullYear()}&month=${datetime.getMonth()}&day=${datetime.getDate()}&hour=${datetime.getHours()}&minute=${datetime.getMinutes()}&duration=${duration}&image_type=${type}`

    return new Promise((resolve, reject) => {
        request(imageListURL, (error, response, body) => {
            if(error) reject(error);
            else if(body.indexOf('blobArray')<0) reject("Image type not available at specified time");
            else if(response.statusCode !== 200) reject("Unsuccessful response from server");
            else if(!error && response.statusCode == 200) {
                var re = /^\s*blobArray = \[([\s\S]*)\],$/gm;
                var blobArray = re.exec(body)[1]
                    .split('\n')
                    .filter((s) => { return !s.match(/^\s+$/); })
                    .map((s) => { return /s*'(.*)',/.exec(s)[1]; });
                resolve(blobArray);
            }
        });
    });
};
