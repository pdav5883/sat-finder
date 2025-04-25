import { Quaternion } from 'quaternion'
import { initCommon } from "./shared.js"

var rad = Math.PI / 180
var current_alpha = 0
var alpha_offset = 0
var pointingStarted = false

$(function() {
  initCommon()
  document.getElementById("pointbutton").onclick = startOrCalibrate
  document.getElementById("startbutton").addEventListener("click", startOrientation)
  document.getElementById("calbutton").addEventListener("click", calibrateAlpha)
})

function handleOrientation(event) {
  current_alpha = event.alpha

  var ae = eulerToAzEl(correctAlpha(event.alpha), event.beta, event.gamma)
  document.getElementById("elevationcell").innerHTML = Math.round(ae[1]) + "&deg;"
  document.getElementById("azimuthcell").innerHTML = Math.round(ae[0]) + "&deg;"
}


function startOrCalibrate() {
  if (pointingStarted) {
    calibrateAlpha()
  }
  else {
    startOrientation()
    document.getElementById("pointbutton").innerHTML = "Calibrate"
    pointingStarted = true
  }
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
  /*var statusText = document.getElementById("statustext")

  if (window.DeviceOrientationEvent) {
    statusText.innerHTML = "Orientation Supported"
  }
  else {
    statusText.innerHTML = "Orientation NOT Supported"
  }*/
  return true
}
