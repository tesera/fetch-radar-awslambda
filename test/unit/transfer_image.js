const assert = require('assert');
const lambda = require('../../index');


describe('transferImage()', function() {
    var bucket = 'weather-radar';
    var image_obj = { type: 'PRECIPET_SNOW_WEATHEROFFICE', image: '/lib/radar/image.php?time=17-OCT-15+12.23.33.962333+AM&site=WUJ' };

    it('Transfers the image from weather.gc.ca to aws s3', function(done) {
        var expected = null;
        this.timeout(0);

        lambda.getS3 = function() {
            return { putObject: function(args, cb) { cb(null, {ETag: 'asdfasfd'}); } }
        };

        lambda.transferImage(image_obj.image, bucket, 'test/WUJ-PRECIPET_SNOW_WEATHEROFFICE-17OCT15_12.23.33').then((actual) => {
            if('ETag' in actual) done();
            else done("ETag was not returned from S3");
        })
        .catch(done);
    });
});
