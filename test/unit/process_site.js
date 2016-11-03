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
        this.timeout(0);

        lambda.stub('getImageURLs', () => Promise.resolve([1]));
        lambda.stub('transferImage', () => Promise.resolve("transfer images result"));

        return lambda.processSite(site, types, datetime).then(actual => assert.deepEqual(expected, actual));
    });

    it('Calls transfer image for each image returned from getImageURLs', function(done) {
        done('WIP');
    });
});
