import os
import sys
sys.path.append(os.getcwd()+"/lib")

import re
import urllib2
import datetime
import boto3
from dateutil.parser import parse
from joblib import Parallel, delayed
from dotenv import load_dotenv, find_dotenv

s3 = boto3.resource('s3')
load_dotenv(find_dotenv())
image_types = ['PRECIPET_SNOW_WEATHEROFFICE',
               'PRECIPET_SNOW_A11Y_WEATHEROFFICE',
               'PRECIPET_RAIN_WEATHEROFFICE',
               'PRECIPET_RAIN_A11Y_WEATHEROFFICE',
               'COMP_PRECIPET_SNOW_WEATHEROFFICE',
               'COMP_PRECIPET_SNOW_A11Y_WEATHEROFFICE',
               'COMP_PRECIPET_RAIN_WEATHEROFFICE',
               'COMP_PRECIPET_RAIN_A11Y_WEATHEROFFICE']

def lambda_handler(event, context):
    bucket = os.environ['BUCKET']
    sites = os.environ['SITES'].split(',')
    date = parse(event['time'])
    args_list = [(site, date, bucket) for site in sites]
    return Parallel(n_jobs=8)(delayed(process_site)(args) for args in args_list)

def process_site(args):
    site, date, bucket = args
    print "Processing %(site)s: %(date)s" % locals()
    t = date - datetime.timedelta(days=1)
    morning_urls = [get_image_urls(site, image_type, t.year, t.month, t.day, '00', '00', 12) for image_type in image_types]
    evening_urls = [get_image_urls(site, image_type, t.year, t.month, t.day, '12', '00', 12) for image_type in image_types]
    url_list = sum(morning_urls + evening_urls, [])
    return transfer_images(site, url_list, bucket)

def transfer_images(site, images, bucket):
    uploads = []
    images = [image for image in images if image]
    for image in images:
        print "Downloading %(url)s (%(type)s)" % image
        image_type = image['type']
        # regex operates on: "/lib/radar/image.php?time=01-JAN-16+12.20.46.889824+AM&site=NAT"
        results = re.search(r'image\.php\?time=([0-9]{2})-([A-Z]*)-([0-9]{2})\+([0-9]{2})\.([0-9]{2})\.([0-9]{2}).*$', image['url'])
        year, month, day, hour, minute = (results.group(1), results.group(2), results.group(3), results.group(4), results.group(5))
        result = s3.Object('weather-radar', 'radar-%(site)s-%(image_type)s-%(year)s-%(month)s-%(day)s_%(hour)s_%(minute)s.gif' % locals()).put(Body=urllib2.urlopen('http://climate.weather.gc.ca%(url)s' % image, 'rb').read())
        uploads.append(result['ResponseMetadata']['HTTPStatusCode'])
    return { site: all(r == 200 for r in uploads)}

def get_image_urls(site, image_type, year, month, day, hour, minute, duration):
    url = "http://climate.weather.gc.ca/radar/index_e.html?site=%(site)s&year=%(year)i&month=%(month)i&day=%(day)i&hour=%(hour)s&minute=%(minute)s&duration=%(duration)i&image_type=%(image_type)s" % locals()
    html = urllib2.urlopen(url).read()
    results = re.search(r'^\s*blobArray\s*=\s*(\[.*?\])\s*,\s*$', html, flags=re.DOTALL | re.MULTILINE)
    if results is None: return [None]
    js = results.group(1).replace("'",'"')

    # too dirty to parse with json
    images = []
    pattern = re.compile(r'(\/lib\/radar\/image\.php\?time=.*&site=[A-Z]*)')
    for image in re.findall(pattern, js):
        images.append(image)

    return [{ 'type': image_type, 'url': image } for image in images[:12]]

