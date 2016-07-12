import os
import re
import urllib2
import datetime
import boto3
import sys
from multiprocessing import Pool
from dateutil.parser import parse

sys.path.append(os.getcwd()+"/lib")
from dotenv import load_dotenv, find_dotenv

s3 = boto3.resource('s3')
load_dotenv(find_dotenv())

def lambda_handler(event, context):
    bucket = os.environ['BUCKET']
    sites = os.environ['SITES'].split(',')
    date = parse(event['time'])
    p = Pool(10)
    args = [(site, date, bucket) for site in sites]
    return p.map(process_site, args)

def process_site(args):
    site, date, bucket = args
    print "Processing %(site)s: %(date)s" % locals()
    t = date - datetime.timedelta(days=1)
    morning_urls = get_image_urls(site, t.year, t.month, t.day, '00', '00', 12)
    evening_urls = get_image_urls(site, t.year, t.month, t.day, '12', '00', 12)
    return transfer_images(site, morning_urls + evening_urls, bucket)

def transfer_images(site, images, bucket):
    uploads = []
    images = [image for image in images if image]
    for image in images:
        print "Downloading %(image)s" % locals()
        # regex operates on: "/lib/radar/image.php?time=01-JAN-16+12.20.46.889824+AM&site=NAT"
        results = re.search(r'image\.php\?time=([0-9]{2})-([A-Z]*)-([0-9]{2})\+([0-9]{2})\.([0-9]{2})\.([0-9]{2}).*$', image)
        day, month, year, hour, minute = (results.group(1), results.group(2), results.group(3), results.group(4), results.group(5))
        result = s3.Object('weather-radar', 'radar-%(site)s-%(year)s-%(month)s-%(day)s_%(hour)s_%(minute)s.gif' % locals()).put(Body=urllib2.urlopen('http://climate.weather.gc.ca%(image)s' % locals(), 'rb').read())
        uploads.append(result['ResponseMetadata']['HTTPStatusCode'])
    return all(r == 200 for r in uploads)

def get_image_urls(site, year, month, day, hour, minute, duration):
    url = "http://climate.weather.gc.ca/radar/index_e.html?site=%(site)s&year=%(year)i&month=%(month)i&day=%(day)i&hour=%(hour)s&minute=%(minute)s&duration=%(duration)i&image_type=PRECIPET_RAIN_WEATHEROFFICE" % locals()
    html = urllib2.urlopen(url).read()
    results = re.search(r'^\s*blobArray\s*=\s*(\[.*?\])\s*,\s*$', html, flags=re.DOTALL | re.MULTILINE)
    if results is None: return [None]
    js = results.group(1).replace("'",'"')

    # too dirty to parse with json
    images = []
    pattern = re.compile(r'(\/lib\/radar\/image\.php\?time=.*&site=[A-Z]*)')
    for image in re.findall(pattern, js):
        images.append(image)

    return images[:12]

