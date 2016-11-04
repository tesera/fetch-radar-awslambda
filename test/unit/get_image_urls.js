const assert = require('assert');
const lambda = require('../../index');


describe('getImageURLs()', function() {

    it('finds and returns the image URLs', function() {
        var site = 'WUJ';
        var type = 'PRECIPET_SNOW_WEATHEROFFICE'
        var datetime = new Date(2015,10,17,10);
        datetime.setHours(0);
        var expected = [
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+01.10.52.248077+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+02.21.11.278688+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+03.21.03.511521+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+04.20.56.592829+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+05.21.55.921080+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+06.33.15.455839+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+07.11.02.240672+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+08.10.29.873196+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+09.10.43.867816+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+10.10.35.793302+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+11.11.03.537530+AM&site=WUJ' },
            { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.10.49.841273+PM&site=WUJ' }
        ];

        return lambda.getImageURLs(site, type, datetime)
            .then((actual) => assert.deepEqual(expected, actual));
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
