import $ from "jquery"
import { Quaternion } from 'quaternion'

const rad = Math.PI / 180
let current_alpha = 0
let alpha_offset = 0
let pointingStarted = false

export function initPointing() {
  $("#pointbutton").on("click", startOrCalibrate)
}

function handleOrientation(event) {
  current_alpha = event.alpha

  const ae = eulerToAzEl(correctAlpha(event.alpha), event.beta, event.gamma)
  $("#elevationcell").html(`${Math.round(ae[1])}°`)
  $("#azimuthcell").html(`${Math.round(ae[0])}°`)
}

function startOrCalibrate() {
  if (pointingStarted) {
    calibrateAlpha()
  } else {
    startOrientation()
    $("#pointbutton").html("Calibrate")
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
      .catch(console.error)
  } else {
    // non-ios devices
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
  return Quaternion.fromEuler(alpha * rad, beta * rad, gamma * rad, 'ZXY')
}

function eulerToAzEl(alpha, beta, gamma) {
  var v = eulerToVec(alpha, beta, gamma)
  var el = Math.asin(v[2]) / rad
  var az = Math.atan2(v[0], v[1]) / rad
  return [az, el]
}

function eulerToVec(alpha, beta, gamma) {
  var q = eulerToQuaternion(alpha, beta, gamma)
  return q.rotateVector([0, 0, -1])
}

function checkStatus() {
  /*var statusText = $("#statustext")

  if (window.DeviceOrientationEvent) {
    statusText.html("Orientation Supported")
  } else {
    statusText.html("Orientation NOT Supported")
  }*/
  return true
}
