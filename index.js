
const AWS = require('aws-sdk');
const http = require('http');
const request = require('request');
const S3 = new AWS.S3();

try {
    require('node-env-file')('.env');
} catch(err) {
    if(err instanceof TypeError && err.message.substring(0,30) == "Environment file doesn't exist") console.log('ERROR: Could not find .env file.');
    else throw err;
}

exports.handler = function(event, context) {

    bucket = process.env.BUCKET;
    sites = process.env.SITES.split(',');
    types = process.env.TYPES.split(',');

    event['time'] = new Date(event['time']);

    return Promise.all(sites.map((site) => exports.processSite(site, types, event['time'], bucket)));
};

exports.getImageURLs = function(site, type, datetime) {
    var duration = 12;
    var imageListURL = `http://climate.weather.gc.ca/radar/index_e.html?site=${site}&year=${datetime.getFullYear()}&month=${datetime.getMonth()}&day=${datetime.getDate()}&hour=${datetime.getHours()}&minute=${datetime.getMinutes()}&duration=${duration}&image_type=${type}`

    return new Promise((resolve, reject) => {
        request(imageListURL, (error, response, body) => {
            if(error) reject(error);
            else if(body.indexOf('blobArray')<0) reject(`Image not available: site=${site} type=${type} datetime=${datetime}`);
            else if(response.statusCode !== 200) reject("Unsuccessful response from server: site=${site} type=${type} datetime=${datetime}");
            else if(!error && response.statusCode == 200) {
                var re = /^\s*blobArray = \[([\s\S]*)\],$/gm;
                var blobArray = re.exec(body)[1]
                    .split('\n')
                    .filter((s) => { return !s.match(/^\s+$/); })
                    .map((s) => { return /s*'(.*)',/.exec(s)[1]; })
                    .map((url) => { return {type: type, image: url}; })
                resolve(blobArray);
            }
        });
    });
};

exports.processSite = function(site, types, datetime, bucket) {
    var morning = new Date(datetime);
    morning.setHours(0);
    var evening = new Date(datetime);
    evening.setHours(12);

    return Promise.all(types.map(type =>

        Promise.all([
            getSiteUrls(site, type, morning),
            getSiteUrls(site, type, evening)
        ]) // 2 arrays of 12 urls each
        
        .then((results) => {
            var morning_urls = results[0];
            var evening_urls = results[1];
            var all_urls = morning_urls.concat(evening_urls);

            return all_urls; // 1 array of 24 urls
        })
        
        .then(image_urls => Promise.all(
            // map the image_url to a request
            image_urls.map( image_url => exports.transferImage(image_url, bucket, 'filename here') )
        ))
        
    ));
  
    function debugAndReturn(thing) {
        console.log('debug: ', thing);
        return thing;
    }

    function getSiteUrls(site, type, timeofday) {
        return exports.getImageURLs(site, type, timeofday).catch(errorHandler);
    }
  
    function errorHandler(err) {
        console.error(err);
        return [];
    }
};

exports.transferImage = function(image_url, bucket, filename) {
    var image_url = `http://climate.weather.gc.ca${image_url}`;
    return new Promise((resolve, reject) => {
        request(image_url, (error, response, body) => {
            exports.getS3().putObject({
                Bucket: bucket,
                Key: filename,
                Body: body
            }, (err, data) => {
                if(err) reject(err);
                else resolve(data);
            });
        });
    });
};

exports.getS3 = function() {
    return S3;
};

