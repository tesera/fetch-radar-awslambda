const assert = require('assert');
const lambda = require('../test_helper');

var actual;
beforeEach(() => {
    actual = [];
    lambda.unstub()
});

describe('processSite()', function() {
    var types = ['PRECIPET_SNOW_WEATHEROFFICE','PRECIPET_SNOW_A11Y_WEATHEROFFICE'];
    var site = 'WUJ';
    var datetime = new Date(2015,10,17);
    var bucket = 'somebucket';

    it('Makes a call to getImageURLs for each type for the requested site', function() {
        lambda.stub('getImageURLs', () => Promise.resolve([{ type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' }]));
        lambda.stub('transferImageQueue.push', (obj) => actual.push(obj.image));
        var expected = [
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ",
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ",
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ",
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ"
        ];

        return lambda.processSite(site, types, datetime).then(result => assert.deepEqual(expected, actual));
    });

    it('Calls transfer image for each image returned from getImageURLs', function(done) {
        lambda.stub('getImageURLs', () => Promise.resolve([{ type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' }]));
        lambda.stub('transferImageQueue.push', (obj) => actual.push(obj.image));
        var expected = [
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ",
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ",
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ",
            "/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ"
        ];

        lambda.processSite(site, types, datetime).then((result) => {
            assert.deepEqual(expected, actual);
            done();
        })
        .catch(done);
    });
});

describe('filenameForImg()', function() {
    var img = { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' };

    it('calculates the correct filename for a supplied img', function() {
        var actual = lambda.filenameForImg(img);
        var expected = '2015-10-17/WUJ/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif'
        assert.equal(expected, actual);
    });

    it('calculates the correct path based on an environment variable', function() {
        var savedPath = process.env.S3_PATH;
        process.env.S3_PATH = 'YEAR/YEAR/YEAR'
        var expected = '2015/2015/2015/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif'
        var actual = lambda.filenameForImg(img);
        assert.equal(expected, actual);
        process.env.S3_PATH = savedPath;
    });
});
