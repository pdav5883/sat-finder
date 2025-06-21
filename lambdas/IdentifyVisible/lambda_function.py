import os
import json
from datetime import datetime
import boto3

import numpy as np

from skyfield.api import load, utc, load_file
from skyfield.sgp4lib import EarthSatellite
from skyfield.framelib import itrs

# Constants
DEG2RAD = 0.017453292519943296
RAD2DEG = 57.295779513082321
RE_SEMIMAJOR_M = 6378137.0
RE_SEMIMINOR_M = 6356752.0
RE_MEAN_M = 6371008.0
DEFAULT_THRESHOLD = 20

s3 = boto3.client("s3")
obj_bucket = os.environ["BUCKET_NAME"]
obj_sats_key = "brightest.json"
obj_ephem_key = "de421.bsp"
lambda_tmp = "/tmp"


def test_local(local_dir, lat, lon, az, el, time_utc):
    """
    Runs lambda_handler using path as a stand-in for bucket
    """
    event = {"localTestDir": local_dir,
             "queryStringParameters": {"lat": lat,
                                       "lon": lon,
                                       "az": az,
                                       "el": el,
                                       "time_utc": time_utc
                                      }
            }

    res = lambda_handler(event, None)
    print(res)


def lambda_handler(event, context):
    """
    For GET request, parameters are in event['queryStringParameters']

    {"lat": lat_degrees, "lon": lon_degrees, "az": az_degrees,
    "el": el_degrees, "time_utc": YYYY-MM-DD HH:MM:SS string,
    "threshold": max_err_degrees}

    Returns:
    list of dicts {"name": str, "err": float, "az": float, "el": float}
    """
    if "localTestDir" in event:
        local_dir = event["localTestDir"]
    else:
        local_dir = None

    lat = float(event["queryStringParameters"]["lat"])
    lon = float(event["queryStringParameters"]["lon"])
    az = float(event["queryStringParameters"]["az"])
    el = float(event["queryStringParameters"]["el"])
    time_utc = event["queryStringParameters"]["time_utc"]
    threshold = float(event["queryStringParameters"].get("threshold", DEFAULT_THRESHOLD))

    print("Identify object from location lat: {}, lon:{} at time: {}".format(lat, lon, time_utc))
    print("Object direction az: {}, el: {}".format(az, el))

    lla = np.array([lat, lon, 0])
    sats = read_satellite_data(local_dir)
    ephem = load_ephemeris(local_dir)
    sats_ecef, sunlit = propagate_ecef_sunlit(sats, time_utc, ephem)
    norad_ids = get_norad_ids(sats)
    res = identify_object(az, el, list(sats.keys()), sats_ecef, sunlit, lla, threshold, norad_ids)

    if len(res) == 0:
        print("No nearby results found")
    else:
        print("Results: {}".format(res))

    return res


def identify_object(dir_az, dir_el, sat_names, sats_ecef, sunlit, lla, threshold, norad_ids):
    """
    Returns names of satellites that are in view of lla location

    Parameters:
    dir_az: object azimuth (clockwise from North) in deg
    dir_el: object elevation in deg
    sat_names: N, list of satellite names
    sats_ecef: N,3 np.array of satellite ECEF positions in meters
    sun_ecef: 3, np.array unit vector
    sunlit: N, list of bools
    lla: 3, np.array lat/lon/alt in deg/deg/alt
    threshold: number of degrees error to return in list
    norad_ids: N, list of NORAD IDs

    Returns:
    list of dicts {"name": str, "err": float, "az": float, "el": float, "norad_id": str}
    """
    # check to make sure we're pointing above horizon
    if dir_el < 0:
        print("identify_object: returning empty because pointing direction is below horizon (el < 0)")
        return []

    pos = lla_to_ecef(lla)
    
    # define local frame, compute object direction in ECEF
    normal = lla_to_ecef_normal(lla) # z
    north = np.array([0,0,1]) # y
    north = north - np.dot(north, normal) * normal
    north = north / np.linalg.norm(north)
    east = np.cross(north, normal) # x

    dir_local_x = np.cos(dir_el * DEG2RAD) * np.sin(dir_az * DEG2RAD)
    dir_local_y = np.cos(dir_el * DEG2RAD) * np.cos(dir_az * DEG2RAD)
    dir_local_z = np.sin(dir_el * DEG2RAD)

    dir_ecef = dir_local_x * east + dir_local_y * north + dir_local_z * normal

    cos_threshold = np.cos(threshold * DEG2RAD)

    res = []
    
    for i in range(sats_ecef.shape[0]):
        sat_pos = sats_ecef[i, :]
        sat_rel = sat_pos - pos
        sat_rel_unit = sat_rel / np.linalg.norm(sat_rel)

        cos_err = np.dot(sat_rel_unit, dir_ecef)

        # only append if this satellite is within threshold of pointing direction, sunlit, above horizon
        print(cos_err, cos_threshold, sunlit[i])
        if (cos_err > cos_threshold) and sunlit[i]:
            err = np.arccos(cos_err) * RAD2DEG

            # az/el in local frame, az CW from NORTH 
            cos_theta = np.dot(normal, sat_rel_unit)
            sat_el = 90.0 - np.arccos(cos_theta) * RAD2DEG

            sat_north = np.dot(sat_rel_unit, north)
            sat_east = np.dot(sat_rel_unit, east)
            sat_az = np.arctan2(sat_east, sat_north) * RAD2DEG

            res.append({"name": sat_names[i],
                        "err": int(err),
                        "az": int(sat_az),
                        "el": int(sat_el),
                        "norad_id": norad_ids[i]})
    
    return res


def read_satellite_data(local_dir=None):
    """
    Read satellite data from data.json file stored in S3, return as dict

    Parameters:

    Returns:
    sat dict with name keys and tle tuple values
    """
    if local_dir is None:
        data_s3 = s3.get_object(Bucket=obj_bucket, Key=obj_sats_key)
        return json.loads(data_s3["Body"].read().decode("UTF-8"))
    else:
        with open(local_dir + "/" + obj_sats_key) as fptr:
            data_local = json.load(fptr)
        return data_local


def load_ephemeris(local_dir=None):
    """
    Use skyfield to load ephemeris from s3
    """
    if local_dir is None:
        lambda_path = lambda_tmp + "/" + obj_ephem_key
        if not os.path.exists(lambda_path):
            print("Downloading ephem file from S3")
            s3.download_file(Bucket=obj_bucket, Key=obj_ephem_key, Filename=lambda_path)

        return load_file(lambda_path)

    else:
        local_path = local_dir + "/" + obj_ephem_key
        return load_file(local_path)


def propagate_ecef_sunlit(sats, time_utc, ephem):
    """
    Calc ECEF position and sunlit status of each sat in sats dict at time

    Parameters:
    sats: dict of sat name (key) and tle (value)
    time_utc: string in format YYYY-MM-DD HH:MM:SS of propagation end time
    ephem: ephemeris object with sun data from load_ephemeris()
    
    Returns:
    N,3 ECEF position array in meters
    N, boolean list of whether satellite is sunlit in position
    """
    # convert time to skyfield time format
    timescale = load.timescale(builtin=True)
    time_dt = datetime.strptime(time_utc, "%Y-%m-%d %H:%M:%S")
    time_ts = timescale.utc(time_dt.replace(tzinfo=utc))

    pos_list = []
    sunlit_list = []

    for sat_name, tle in sats.items():
        sat = EarthSatellite(line1=tle[0], line2=tle[1])
        pos = sat.at(time_ts)
        pos_list.append(pos.frame_xyz(itrs).m)
        sunlit_list.append(bool(pos.is_sunlit(ephem)))

    return np.array(pos_list), sunlit_list


def get_sun_direction_ecef(time_utc, ephem):
    """
    Get the sun unit vector in ECEF frame

    Parameters:
    time_utc: string in format YYYY-MM-DD HH:MM:SS of propagation end time
    ephem: ephemeris object with sun data from load_ephemeris()

    Returns:
    3, numpy array of sun unit vector from ECEF
    """
    # convert time to skyfield time format
    timescale = load.timescale(builtin=True)
    time_dt = datetime.strptime(time_utc, "%Y-%m-%d %H:%M:%S")
    time_ts = timescale.utc(time_dt.replace(tzinfo=utc))
    
    sun, earth = ephem["sun"], ephem["earth"]

    pos = earth.at(time_ts).observe(sun)
    pos_ecef = pos.frame_xyz(itrs).au
    return pos_ecef / np.linalg.norm(pos_ecef)


def lla_to_ecef(lla):
    """
    Convert lat/lon/alt to earth-centered position vector

    See https://en.wikipedia.org/wiki/Geographic_coordinate_conversion#From_geodetic_to_ECEF_coordinates

    Parameters:
    lla: 3, np.array in deg/deg/m
    
    Returns:
    3, np.array in meters
    """
    sin_lat = np.sin(lla[0] * DEG2RAD)
    cos_lat = np.cos(lla[0] * DEG2RAD)
    sin_lon = np.sin(lla[1] * DEG2RAD)
    cos_lon = np.cos(lla[1] * DEG2RAD)

    ratio_square = (RE_SEMIMINOR_M ** 2) / (RE_SEMIMAJOR_M ** 2)
    ecc_square = 1 - ratio_square

    N = RE_SEMIMAJOR_M / np.sqrt(1 - ecc_square * sin_lat * sin_lat)

    x = (N + lla[2]) * cos_lat * cos_lon
    y = (N + lla[2]) * cos_lat * sin_lon
    z = (ratio_square * N + lla[2]) * sin_lat

    return np.array([x, y, z])


def lla_to_ecef_normal(lla):
    """
    Normal/zenith direction in ECEF frame

    Parameters:
    lla: 3, np.array lat/lon/alt in deg/deg/m

    Returns:
    3, np.array unit normal vector of lla position
    """
    lat = lla[0] * DEG2RAD
    lon = lla[1] * DEG2RAD
    
    return np.array([np.cos(lat) * np.cos(lon),
                     np.cos(lat) * np.sin(lon),
                     np.sin(lat)])


def get_norad_ids(sats):
    """
    Get NORAD IDs from satellite names
    """
    ids = []
    for _, tle2 in sats.values():
        ids.append(tle2.split()[1])
    
    return ids

