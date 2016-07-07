import urllib2
import re
from lib.BeautifulSoup import BeautifulSoup
from dateutil.parser import parse

def lambda_handler(event, context):
    t = parse(event['time'])
    morning_urls = get_image_urls('NAT', t.year, t.month, t.day, '00', '00', 12)
    evening_urls = get_image_urls('NAT', t.year, t.month, t.day, '12', '00', 12)
    return morning_urls + evening_urls


def get_image_urls(site, year, month, day, hour, minute, duration):
    url = "http://climate.weather.gc.ca/radar/index_e.html?site=%(site)s&year=%(year)i&month=%(month)i&day=%(day)i&hour=%(hour)s&minute=%(minute)s&duration=%(duration)i&image_type=PRECIPET_RAIN_WEATHEROFFICE" % locals()
    print url

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

