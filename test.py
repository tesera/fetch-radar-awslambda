import json
from radar import lambda_handler

event = json.loads("""{
  "account": "123456789012",
  "region": "us-east-1",
  "detail": {},
  "detail-type": "Daily",
  "source": "aws.events",
  "time": "2016-01-01T00:00:00Z",
  "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
  "resources": [
    "arn:aws:events:us-east-1:123456789012:rule/daily"
  ]
}""")

print lambda_handler(event, None)