const assert = require('assert');
const lambda = require('../index');


describe('getImageURLs()', function() {

    it('finds and returns the image URLs', function(done) {
        var site = 'WUJ';
        var type = 'PRECIPET_SNOW_WEATHEROFFICE'
        var datetime = new Date(2015,10,17,10);
        var expected = [
            '/lib/radar/image.php?time=17-OCT-15+10.10.35.793302+AM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+11.11.03.537530+AM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+12.10.49.841273+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+01.10.48.682039+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+02.10.55.858334+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+03.10.49.030733+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+04.10.35.781304+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+05.10.37.297283+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+06.10.39.525245+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+07.10.38.930713+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+08.10.34.513546+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+09.10.35.458651+PM&site=WUJ',
            '/lib/radar/image.php?time=17-OCT-15+10.10.29.481384+PM&site=WUJ',
        ];

        lambda.getImageURLs(site, type, datetime)
            .then((actual) => {
                assert.deepEqual(expected, actual);
                done();
            })
            .catch(done);
    });

    it('throws an error when the image type is not available at the specified time', function(done) {
        var site = 'WUJ';
        var type = 'COMP_PRECIPET_RAIN_A11Y_WEATHEROFFICE'
        var datetime = new Date(2015,01,12,00);
        var expected_error = "Image type not available at specified time";

        lambda.getImageURLs(site, type, datetime)
            .then((actual) => {
                done("Did not receive expected error");
            })
            .catch(function(message) {
                if(message == expected_error) done();
                else done("Did not receive expected error");
            })
    });
});
