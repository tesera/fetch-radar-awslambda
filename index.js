
const AWS = require('aws-sdk');
const http = require('http');
const request = require('request');
const S3 = new AWS.S3();
const url = require('url');
const querystring = require('querystring');
const moment = require('moment');
const winston = require('winston');

try {
    require('node-env-file')('.env');
    if(process.env.LOG_LEVEL) winston.level = process.env.LOG_LEVEL;
} catch(err) {
    if(err instanceof TypeError && err.message.substring(0,30) == "Environment file doesn't exist") console.log('ERROR: Could not find .env file.');
    else throw err;
}

exports.handler = function(event, context, callback) {
    winston.info("Starting radar grab");

    bucket = process.env.BUCKET;
    sites = process.env.SITES.split(',');
    types = process.env.TYPES.split(',');
    winston.info({bucket: bucket, sites, types})

    event['time'] = new Date(event['time']);
    event['time'] = new Date(event['time'].getTime()-86400000);

    return Promise.all(sites.map((site) => exports.processSite(site, types, event['time'], bucket)))
        .then((result) => callback(null, result))
        .catch(callback);
};

exports.getImageURLs = function(site, type, datetime) {
    winston.info(`Processing SITE=${site} TYPE=${type}`)
    var duration = 12;
    var imageListURL = `http://climate.weather.gc.ca/radar/index_e.html?site=${site}&year=${datetime.getFullYear()}&month=${datetime.getMonth()}&day=${datetime.getDate()}&hour=${datetime.getHours()}&minute=0&duration=${duration}&image_type=${type}`

    return new Promise((resolve, reject) => {
        request(imageListURL, (error, response, body) => {
            if(error) reject(error);
            else if(body.indexOf('blobArray')<0) reject(`Image list not available for site=${site} type=${type} datetime=${datetime}`);
            else if(response.statusCode !== 200) reject("Error getting image list for site=${site} type=${type} datetime=${datetime}");
            else if(!error && response.statusCode == 200) {
                var re = /^\s*blobArray = \[([\s\S]*)\],$/gm;
                var blobArray = re.exec(body)[1]
                    .split('\n')
                    .filter((s) => { return !s.match(/^\s+$/); })
                    .map((s) => { return /s*'(.*)',/.exec(s)[1]; })
                    .map((url) => { return {type: type, image: url}; })
                winston.debug("Got image list for", {site, type, url: imageListURL, times: blobArray.map((res) => moment(res.image, 'DD-MMM-YY hh.mm.ss.SSS a').format('YYYYMMDD-HHmmss'))});
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

        .then(images => Promise.all(
            // map the image_url to a request
            images.map( img => exports.transferImage(img['image'], bucket, exports.filenameForImg(img)) )
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
        winston.warn(err);
        return [];
    }
};

exports.openTransfers = 0;
exports.completedTransfers = 0;
exports.failedTransfers = 0;

exports.transferImage = function(image_url, bucket, filename) {
    this.openTransfers++;
    var image_url = `http://climate.weather.gc.ca${image_url}`;
    return new Promise((resolve, reject) => {
        request(image_url, (error, response, body) => {
            exports.getS3().putObject({
                Bucket: bucket,
                Key: filename,
                Body: body
            }, (err, data) => {
                this.completedTransfers++;
                
                if(err) {
                    reject(err);
                    winston.debug(`(${this.completedTransfers}/${this.openTransfers}/${this.failedTransfers}) FAILED s3://${bucket}/${filename} ERROR: ${err}`);
                } else {
                    resolve(data);
                    winston.debug(`(${this.completedTransfers}/${this.openTransfers}/${this.failedTransfers}) Finished s3://${bucket}/${filename}`);
                }
            });
        });
    });
};

exports.filenameForImg = function(img) {
    if(!process.env.S3_PATH) process.env.S3_PATH = 'YEAR/MONTH/SITE'
    var query = url.parse(img['image']).query;
    var params = querystring.parse(query);
    var date = moment(params.time, 'DD-MMM-YY hh.mm.ss.SSS a')
    var s3path = process.env.S3_PATH 
        .replace(/SITE/g, params.site)
        .replace(/YEAR/g, date.format('YYYY'))
        .replace(/MONTH/g, date.format('MMM'));
    var datestr = date.format('YYYYMMDD-HHmmss');
    var site = params.site;
    return `${s3path}/${datestr}-${params.site}-${img.type}.gif`;
};

exports.getS3 = function() {
    return S3;
};

