# sat-finder
A web application to find satellites in the sky. This repo contains all of the html/css/javascript that runs in the browser, as well as the python code that runs in a variety of AWS lambdas to do the "heavy" lifting for things like orbit propagation and visibility calculations. There are three ways that sat-finder can provide interesting information:
- `get_visible`: show all the satellites in view of a given location at a given time
- `id_visible`: (WIP) attempt to identify the satellite at a given location in the sky
- `get_opportunities`: (WIP) show the best satellite visibility opportunites in the next 24 hours

## TODO
- Double check visibility times against STK
- Sort returned satellites by sunlit and elevation
- Refresh catalog on schedule job
- Expand list of satellites that get propagated, add dropdown to select class

## Elements
- S3 bucket sat-finder-public: stores html, scripts, styles
- S3 bucket sat-finder-private: stores lambda code, data file
- Lambda sat-finder-refresh-data: call celestrak API and store as JSON
- Lambda sat-finder-get-visible: compute visibility of satellites given location, time: make sure to increase memory to 256MB
- API Gateway
	- /visible GET run get-visible lambda with args
	- /refresh GET run refresh-data lambda no args
- Cloudfront: points to sat-finder-public bucket origin with ssl/tls certificate for https, root points to index.html
	- note that https is required for pointing to work in javascript
	- ssl/tls certificate must point to alias domain
- Route 53: within hosted zone for domain create A and AAAA records with record of sats.DOMAIN and value equal to cloudfront distribution name

## Notes
To generate ephem file run: `python -m jplephem excerpt 2022/01/01 2025/12/31 $url de421_new.bsp` where url is https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/a_old_versions/de421.bsp

Testing orientation is a pain because chrome by default doesn't allow DeviceOrientationEvent over http, only https. Exception if domain is localhost, but this doesn't help because device orientation only matters for mobile devices. To get this working in test, need to go to `chrome://flags` in the mobile browser, search for the `#unsafely-treat-insecure-origin-as-secure` flag and set it to enable with the IP of the server (presumably on LAN). If I'm serving (with e.g. `python -m http.server`) from IP address `192.168.1.5` over port 8000 then in the mobile chrome flag field I would put `http://192.168.1.5:8000`. This will allow the mobile browser to interact with the javascript orientation code.

Orientation angles are finicky because alpha is reset every time device is unlocked. Added calibrate button to set zero alpha at current orientation (phone flat on table). Rotation of 0,0,-1 vector (back of phone) with quaternion takes it into frame where A is x-axis pointing east, B is y-axis pointing north, and C is z-axis pointing up.

## Evolution
- (x) v1: list all satellites in view of given lat/lon at given time
- (x) v2: provide az/el of satellites in view of given loc at current time (or +x minutes)
	- optional: motion heading 
- (x) v3: display az/el pointing from device
- v4: what satellite am I pointing at? 
- v5: what satellites available in next X hours?
	- Assume sun has to be below horizon
- v6: what satellites available, within certain part of sky
- v7: switch from skyfield to custom code


