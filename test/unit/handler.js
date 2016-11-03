const assert = require('assert');
const lambda = require('../test_helper');

beforeEach(() => lambda.unstub());

describe('handler()', function() {
    process.env.TYPES = 'PRECIPET_SNOW_WEATHEROFFICE,PRECIP_RAIN_WEATHEROFFICE';
    process.env.SITES = 'WUJ,XSM';
    var expected = {};

    var scheduledEvent = {
        "account": "123456789012",
        "region": "us-east-1",
        "detail": {},
        "detail-type": "Scheduled Event",
        "source": "aws.events",
        "time": "2013-10-17T00:00:00Z",
        "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
        "resources": [
            "arn:aws:events:us-east-1:123456789012:rule/my-schedule"
        ]
    };;

    it('Requests the images for each type at each site #WIP', function(done) {
        this.timeout(0);

        lambda.stub('getImageURLs', () => Promise.resolve([1]));
        lambda.stub('transferImage', () => Promise.resolve("transfer images result"));

        lambda.handler(scheduledEvent).then((actual) => {
            console.log(actual[0][0]);
            done('WIP');
        })
        .catch(done);
    });
});
