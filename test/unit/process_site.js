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
                'WUJ-PRECIPET_SNOW_WEATHEROFFICE-20151017-002333.gif',
                'WUJ-PRECIPET_SNOW_WEATHEROFFICE-20151017-002333.gif'
            ],
            [
                'WUJ-PRECIPET_SNOW_WEATHEROFFICE-20151017-002333.gif',
                'WUJ-PRECIPET_SNOW_WEATHEROFFICE-20151017-002333.gif'
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
    var expected = 'WUJ-PRECIPET_SNOW_WEATHEROFFICE-20151017-002333.gif'

    it('calculates the correct filename for a supplied img', function() {
        var actual = lambda.filenameForImg(img);
        assert.equal(expected, actual);
    });
});
