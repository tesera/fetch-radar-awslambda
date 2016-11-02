const assert = require('assert');
const lambda = require('../../index');


describe('processSite()', function() {

    var types = ['PRECIPET_SNOW_WEATHEROFFICE','PRECIPET_SNOW_A11Y_WEATHEROFFICE'];
    var site = 'WUJ';
    var datetime = new Date(2015,10,17);

    it('Makes a call for each type 24x for a 24hr period', function(done) {
        var expected = [
            [ 'image array result', 'image array result' ],
            [ 'image array result', 'image array result' ]
        ];
        this.timeout(0);

        lambda.getImageURLs = function() {
            return "image array result";
        };

        lambda.processSite(site, types, datetime).then((actual) => {
            assert.deepEqual(expected, actual);
            done();
        })
        .catch(done);
    });
});
