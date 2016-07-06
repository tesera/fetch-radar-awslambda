# fetch-radar-awslambda

AWS Lambda function to fetch radar images periodically from weather.gc.ca

__endpoint__
http://climate.weather.gc.ca/radar/index_e.html?site=NAT&year=2016&month=7&day=6&hour=13&minute=50&duration=2&image_type=PRECIPET_RAIN_WEATHEROFFICE
HTML markup from that endpoint contains js definition `blobArray` which has the image URLs we 
need to fetch.


