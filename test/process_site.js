const assert = require('assert');
const lambda = require('../index');


describe('processSite()', function() {

    process.env.TYPES = ['PRECIPET_SNOW_WEATHEROFFICE','PRECIPET_SNOW_A11Y_WEATHEROFFICE'];
    var site = 'WUJ';
    var datetime = new Date(2015,10,17);

    it('Makes a call for each type 24x for a 24hr period', function(done) {
        this.timeout(0);

        lambda.processSite(site, datetime).then((actual) => {
            done("WIP");
        })
        .catch(done);

        var expected = false;
    });
});
