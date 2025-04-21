window.onload = checkStatus
var rad = Math.PI / 180
var current_alpha = 0
var alpha_offset = 0

function handleOrientation(event) {
  current_alpha = event.alpha

  document.getElementById("cellA").innerHTML = Math.round(correctAlpha(event.alpha))
  document.getElementById("cellB").innerHTML = Math.round(event.beta)
  document.getElementById("cellC").innerHTML = Math.round(event.gamma)
  
  var v = eulerToVec(correctAlpha(event.alpha), event.beta, event.gamma)
  document.getElementById("cellD").innerHTML = Math.round(v[0]*1000)/1000
  document.getElementById("cellE").innerHTML = Math.round(v[1]*1000)/1000
  document.getElementById("cellF").innerHTML = Math.round(v[2]*1000)/1000
  
  var ae = eulerToAzEl(correctAlpha(event.alpha), event.beta, event.gamma)
  document.getElementById("cellG").innerHTML = Math.round(ae[0])
  document.getElementById("cellH").innerHTML = Math.round(ae[1])
}


function startOrientation() {
  // ios devices
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
	if (permissionState === 'granted') {
	  window.addEventListener("deviceorientation", handleOrientation, true)
	}
      })
      .catch(console.error);
  }
  // non-ios devices
  else {
    window.addEventListener("deviceorientation", handleOrientation, true)
  }
}


function calibrateAlpha() {
  alpha_offset = current_alpha
}


function correctAlpha(alpha) {
  return (alpha - alpha_offset) % 360.0
}


function eulerToQuaternion(alpha, beta, gamma) {
  var q = Quaternion.fromEuler(alpha * rad, beta * rad, gamma * rad, 'ZXY')
  return q
}


function eulerToAzEl(alpha, beta, gamma) {
  var v = eulerToVec(alpha, beta, gamma)
  var el = Math.asin(v[2]) / rad
  var az = Math.atan2(v[0], v[1]) / rad
  return [az, el]
}


function eulerToVec(alpha, beta, gamma) {
  var q = eulerToQuaternion(alpha, beta, gamma)
  var v = q.rotateVector([0, 0, -1])
  return v
}


function checkStatus() {
  var statusText = document.getElementById("statustext")

  if (window.DeviceOrientationEvent) {
    statusText.innerHTML = "Orientation Supported"
  }
  else {
    statusText.innerHTML = "Orientation NOT Supported"
  } 
}
