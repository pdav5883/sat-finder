from datetime import datetime
import urllib.request

import numpy as np

from skyfield.api import load, utc
from skyfield.sgp4lib import EarthSatellite
from skyfield.framelib import itrs

# Constants
DEG2RAD = 0.017453292519943296
RAD2DEG = 57.295779513082321
RE_SEMIMAJOR_M = 6378137.0
RE_SEMIMINOR_M = 6356752.0
RE_MEAN_M = 6371008.0


def fetch_satellite_data():
    """
    Grab satellite data in TLE format from celestrak.

    By default grab brightest group.

    Parameters:
    None

    Returns:
    dict with object name as key: tuple of TLE strings as value
    """
    url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=VISUAL&FORMAT=TLE"

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


def propagate_ecef(sats, time_utc):
    """
    Calc ECEF position of each sat in sats dict at time

    Parameters:
    sats: dict of sat name (key) and tle (value)
    time_utc: string in format YYYY-MM-DD HH:MM:SS of propagation end time
    
    Returns:
    N,3 ECEF position array in meters 
    """
    # convert time to skyfield time format
    timescale = load.timescale(builtin=True)
    time_dt = datetime.strptime(time_utc, "%Y-%m-%d %H:%M:%S")
    time_ts = timescale.utc(time_dt.replace(tzinfo=utc))

    pos_list = []

    for sat_name, tle in sats.items():
        sat = EarthSatellite(line1=tle[0], line2=tle[1])
        pos_ecef = sat.at(time_ts).frame_xyz(itrs).m
        pos_list.append(pos_ecef)

    return np.array(pos_list)


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


def visible_local(sat_names, sats_ecef, lla):
    """
    Returns names of satellites that are in view of lla location

    Parameters:
    sat_names: N, list of satellite names
    sats_ecef: N,3 np.array of satellite ECEF positions in meters
    lla: 3, np.array lat/lon/alt in deg/deg/alt

    Returns:
    M, list of satellite names that are in view
    """
    pos = lla_to_ecef(lla)
    normal = lla_to_ecef_normal(lla)

    inview = []
    
    for i in range(sats_ecef.shape[0]):
        sat_pos = sats_ecef[i, :]
        sat_rel = sat_pos - pos
        sat_rel_unit = sat_rel / np.linalg.norm(sat_rel)

        if np.dot(normal, sat_rel) / np.linalg.norm(sat_rel) > 0:
            inview.append(sat_names[i])

    return inview
