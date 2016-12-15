const assert = require('assert');
const lambda = require('../test_helper');

beforeEach(() => lambda.unstub());

describe('processSite()', function() {
    var types = ['PRECIPET_SNOW_WEATHEROFFICE','PRECIPET_SNOW_A11Y_WEATHEROFFICE'];
    var site = 'WUJ';
    var datetime = new Date(2015,10,17);
    var bucket = 'somebucket';

    it('Makes a call to getImageURLs for each type for the requested site', function() {
        var expected = [
            [ 'transfer images result', 'transfer images result' ],
            [ 'transfer images result', 'transfer images result' ]
        ];

        lambda.stub('getImageURLs', () => Promise.resolve([{ type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' }]));
        lambda.stub('transferImage', () => Promise.resolve("transfer images result"));

        return lambda.processSite(site, types, datetime).then(actual => assert.deepEqual(expected, actual));
    });

    it('Calls transfer image for each image returned from getImageURLs', function(done) {
        lambda.stub('getImageURLs', () => Promise.resolve([{ type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' }]));
        lambda.stub('transferImage', (img, bucket, filename) => Promise.resolve(filename));
        var expected = [
            [
                '2015/Oct/WUJ/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif',
                '2015/Oct/WUJ/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif'
            ],
            [
                '2015/Oct/WUJ/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif',
                '2015/Oct/WUJ/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif'
            ]
        ];

        lambda.processSite(site, types, datetime).then((actual) => {
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
        var expected = '2015/Oct/WUJ/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif'
        assert.equal(expected, actual);
    });

    it('calculates the correct path based on an environment variable', function() {
        var savedPath = process.env.PATH;
        process.env.PATH = 'YEAR/YEAR/YEAR'
        var expected = '2015/2015/2015/20151017-002333-WUJ-PRECIPET_SNOW_WEATHEROFFICE.gif'
        var actual = lambda.filenameForImg(img);
        process.env.PATH = savedPath;
    });
});
