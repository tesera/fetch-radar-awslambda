const assert = require('assert');
const lambda = require('../test_helper');

beforeEach(() => lambda.unstub());

describe('handler()', function() {
    process.env.TYPES = 'PRECIPET_SNOW_WEATHEROFFICE,PRECIP_RAIN_WEATHEROFFICE';
    process.env.SITES = 'WUJ,XSM';

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
    };

    it('Makes the request for the previous day', function() {
        var expected = [1381881600,1381881600];
        lambda.stub('processSite', (site, types, datetime) => Promise.resolve(datetime.getTime()/1000));

        return lambda.handler(scheduledEvent, null, (err, actual) => {
            assert.deepEqual(actual, expected);
            assert.equal(null, err);
        });
    });

    it('Calls process site for each site requested', function() {
        var expected = [ 'WUJ', 'XSM' ];
        lambda.stub('processSite', (site) => Promise.resolve(site));

        return lambda.handler(scheduledEvent, null, (err, actual) => {
            assert.deepEqual(expected, actual);
            assert.equal(null, err);
        });
    });

    it('Supplies the requested types to processSite', function() {
        var expected = [['PRECIPET_SNOW_WEATHEROFFICE','PRECIP_RAIN_WEATHEROFFICE'],['PRECIPET_SNOW_WEATHEROFFICE','PRECIP_RAIN_WEATHEROFFICE']];
        lambda.stub('processSite', (site, types) => Promise.resolve(types));

        return lambda.handler(scheduledEvent, null, (err, actual) => {
            assert.deepEqual(expected, actual);
            assert.equal(null, err);
        });
    });
});
