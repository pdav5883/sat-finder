# sat-finder
A web-application to find satellites in the sky

- v1: list all satellites in view of given lat/lon at given time
- v2: provide az/el of satellites in view of given loc at current time (or +x minutes)
	- optional: use `is_sunlit` method from skyfield
	- optional: provide visibility estimate based on sun angle
	- optional: use device lat/lon
	- optional: any satellites within view in next y minutes
- v3: display az/el pointing from device
- v4: what satellite am I pointing at?
- v5: switch from skyfield to custom code

## Major Functions
- `fetch_satellite_data()` (just brightest for now, download to local
- `propagate_eci(sats_dict, time)`
- `eci_to_ecef(vecs_eci, time)`
- `lla_to_ecef(lat, lon, alt)`
- `visible_local(sats_ecef, pos_ecef)`
