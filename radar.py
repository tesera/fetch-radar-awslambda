import os
import re
import urllib2
import boto3
from lib.bs3.BeautifulSoup import BeautifulSoup
from dateutil.parser import parse
from lib.dotenv.dotenv import load_dotenv, find_dotenv

s3 = boto3.resource('s3')
load_dotenv(find_dotenv())

def lambda_handler(event, context):
    bucket = os.environ['BUCKET']
    t = parse(event['time'])
    morning_urls = get_image_urls('NAT', t.year, t.month, t.day-1, '00', '00', 12)
    evening_urls = get_image_urls('NAT', t.year, t.month, t.day-1, '12', '00', 12)
    return transfer_images(morning_urls + evening_urls, bucket)

def transfer_images(images, bucket):
    uploads = []
    for image in images:
        # regex operates on: "/lib/radar/image.php?time=01-JAN-16+12.20.46.889824+AM&site=NAT"
        results = re.search(r'image\.php\?time=([0-9]{2})-([A-Z]*)-([0-9]{2})\+([0-9]{2})\.([0-9]{2})\.([0-9]{2}).*$', image)
        day, month, year, hour, minute = (results.group(1), results.group(2), results.group(3), results.group(4), results.group(5))
        result = s3.Object('weather-radar', 'radar-%(year)s-%(month)s-%(day)s_%(hour)s_%(minute)s.gif' % locals()).put(Body=urllib2.urlopen('http://climate.weather.gc.ca%(image)s' % locals(), 'rb').read())
        uploads.append(result['ResponseMetadata']['HTTPStatusCode'])
    return all(r == 200 for r in uploads)

def get_image_urls(site, year, month, day, hour, minute, duration):
    url = "http://climate.weather.gc.ca/radar/index_e.html?site=%(site)s&year=%(year)i&month=%(month)i&day=%(day)i&hour=%(hour)s&minute=%(minute)s&duration=%(duration)i&image_type=PRECIPET_RAIN_WEATHEROFFICE" % locals()
    html = urllib2.urlopen(url)
    soup = BeautifulSoup(html)
    script = soup.findAll('script')[2]
    js = re.search(r'^\s*blobArray\s*=\s*(\[.*?\])\s*,\s*$', script.string, flags=re.DOTALL | re.MULTILINE).group(1).replace("'",'"')

    # too dirty to parse with json
    images = []
    pattern = re.compile(r'(\/lib\/radar\/image\.php\?time=.*&site=[A-Z]*)')
    for image in re.findall(pattern, js):
        images.append(image)

    return images[:12]

