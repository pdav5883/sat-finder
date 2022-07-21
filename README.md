# sat-finder
A web-application to find satellites in the sky

- v1: list all satellites in view of given lat/lon at given time
- v2: provide az/el of satellites in view of given loc at current time (or +x minutes)
	- optional: motion heading 
- v3: display az/el pointing from device
- v4: what satellites available in next 20 min? 
- v5: what satellite am I pointing at?
- v6: switch from skyfield to custom code

## TODO
- Double check visibility times against STK

## Major Functions
- `fetch_satellite_data()` (just brightest for now, download to local
- `propagate_eci(sats_dict, time)`
- `eci_to_ecef(vecs_eci, time)`
- `lla_to_ecef(lat, lon, alt)`
- `visible_local(sats_ecef, pos_ecef)`


## Architecture
- S3 bucket sat-finder-public: stores html, scripts, styles
- S3 bucket sat-finder-private: stores lambda code, data file
- Lambda sat-finder-refresh-data: call celestrak API and store as JSON
- Lambda sat-finder-get-visible: compute visibility of satellites given location, time: make sure to increase memory to 256MB
- API Gateway
	- /visible GET run get-visible lambda with args
	- /refresh GET run refresh-data lambda no args

- index
	- What can I see?
	- What am I looking at?

## Notes
To generate ephem file run: `python -m jplephem excerpt 2022/01/01 2025/12/31 $url de421_new.bsp` where url is https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/a_old_versions/de421.bsp

