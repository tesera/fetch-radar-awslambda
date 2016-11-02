const assert = require('assert');
const lambda = require('../../index');


describe('handler()', function() {
    var bucket = 'weather-radar';
    var image_obj = { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' };

    it('fetches all the images', function(done) {
        done('WIP');
    });
});