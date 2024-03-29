import json
import urllib.request
import boto3

s3 = boto3.client("s3")
obj_bucket = "sat-finder-private"
brightest_obj_key = "brightest.json"
gps_obj_key = "gps.json"

brightest_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=VISUAL&FORMAT=TLE"
gps_url = "http://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle"

def lambda_handler(event, context):
    group = event["queryStringParameters"]["group"]

    print("Updating {} sats group".format(group))

    if group == "brightest":
        obj_key = brightest_obj_key
        group_url = brightest_url
    elif group == "gps":
        obj_key = gps_obj_key
        group_url = gps_url

    sats_dict = fetch_satellite_data(group_url)
    sats_bytes = bytes(json.dumps(sats_dict, indent=2).encode("UTF-8"))

    response = s3.put_object(Body=sats_bytes, Bucket=obj_bucket, Key=obj_key)

    return "Object {} updated".format(obj_key)


def fetch_satellite_data(url):
    """
    Grab satellite data in TLE format from celestrak.

    By default grab brightest group.

    Parameters:
    None

    Returns:
    dict with object name as key: tuple of TLE strings as value
    """
    req = urllib.request.urlopen(url)
    tle_text = [t.strip() for t in req.read().decode().split("\n")]

    # sometimes list line of request is empty
    if tle_text[-1] == "":
        tle_text.pop()
    sats = {}

    i = 0
    while i < len(tle_text):
        name = tle_text[i]
        line1 = tle_text[i+1]
        line2 = tle_text[i+2]

        sats[name] = (line1, line2)

        i += 3

    return sats

