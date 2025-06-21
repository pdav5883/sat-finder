# sat-finder
A web application to find objects in the sky. This repo contains all of the html/css/javascript that runs in the browser, as well as the python code that runs in a variety of AWS lambdas for things like orbit propagation and visibility calculations.

There are three ways that sat-finder can provide interesting information:
- **Visible Now**: show all the objects in view of a given location at a given time
- **Identify Object**: find objects near a direction in the sky
- **Opportunities**: show the best satellite visibility opportunites in the next 24 hours

## TODO
- Identify page
- Try out satellite link out: https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-029A but need to find COSPAR ID from TLE first
- Increase size of bright satellites by looking at McCants `qs.mag` text file linked out at https://satobs.org/brite.html


## Prerequisites
- AWS CLI 2
- NPM 10+
- Python 3.12

## Setup
- Create a virtual env at project root: `python -m venv venv`
- Activate virtual env and install python dependencies: `pip install -r requirements.txt`
- Install node dependencies in frontend: `cd frontend; npm install`

## Deployment
- AWS Resources: `cd infrastructure; bash deploy_infrastructure.sh cfn-params.json`
- Frontend: `cd frontend; bash deploy_frontend.sh`
- Lambdas: `cd lambdas; bash deploy_common.sh; bash deploy_lambdas.sh`
  - Common layer build is not working correctly on Windows.


## AWS Resources
- S3 bucket sat-finder-public: stores static website content (HTML, CSS, JavaScript)
- S3 bucket sat-finder-private: stores data files
- Lambda Functions (Python 3.12, 128MB memory):
  - GetOpportunities: Get upcoming observation opportunities
  - GetVisible: Get currently visible satellites
  - IdentifyVisible: Identify visible satellites
  - RefreshData: Get updated satellite data
- API Gateway:
  - /refresh GET: Run RefreshData lambda
  - /visible GET: Run GetVisible lambda
- CloudFront Distribution:
  - Points to sat-finder-public bucket origin
- Route 53:
  - A and AAAA records pointed to CloudFront distro

## Notes
- To generate ephem file run: `python -m jplephem excerpt 2022/01/01 2025/12/31 $url de421_new.bsp` where url is https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/a_old_versions/de421.bsp
- Testing orientation is a pain because chrome by default doesn't allow DeviceOrientationEvent over http, only https. Exception if domain is localhost, but this doesn't help because device orientation only matters for mobile devices. To get this working in test, need to go to `chrome://flags` in the mobile browser, search for the `#unsafely-treat-insecure-origin-as-secure` flag and set it to enable with the IP of the server (presumably on LAN). If I'm serving (with e.g. `python -m http.server`) from IP address `192.168.1.5` over port 8000 then in the mobile chrome flag field I would put `http://192.168.1.5:8000`. This will allow the mobile browser to interact with the javascript orientation code. As best I can tell this does not work on iOS.
- Rotation of 0,0,-1 vector (back of phone) with quaternion takes it into frame where A is x-axis pointing east, B is y-axis pointing north, and C is z-axis pointing up.
- Getting access to orientation data is slightly different for android and iOS. Both use alpha, beta, gamma euler angles, which then get passed into quaternion.js to rotate the [0,0,-1] vector (back of phone) into east/north/up local frame.
  - For android, attach handler to `deviceorientationabsolute` event, which uses the device compass to compute alpha.
  - For iOS, attach handler to `deviceorientation` even, which computes alpha based on relative orientation from when initiliazation happened. iOS provides `webkitCompassHeading` as a separate field in the event, but this moves in the opposite direction of `alpha`. So when passing in euler angles for iOS, using `-1 * event.webkitCompassHeading` in place of alpha.
  - iOS also has the added complexity of needing an explicit action to trigger orientation permission, so adding the handler happens in response to a button click.
  - See https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event and https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientationabsolute_event
- Satellite location is reported in true north heading, but device pointing is reported in magnetic north heading. Offset aka declination is corrected by calling NOAA magnetic model API during initialization of pointing in `shared.js`.

