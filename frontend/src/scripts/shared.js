import $ from "jquery"
import { Quaternion } from 'quaternion'

import "../styles/custom.css"
import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap-icons/font/bootstrap-icons.css'

const rad = Math.PI / 180
let current_alpha = 0
let alpha_offset = 0
let pointingStarted = false


export function initCommon() {
  $(function() {
    $.get("assets/nav.html", navbar => {
      $("#nav-placeholder").replaceWith(navbar);
    });
  });
}

export function initPointing() {
  $("#pointbutton").on("click", startOrCalibrate)
}

export function parseDatetimeUTC(dateStr, timeStr) {
  const dateObj = new Date(Date.parse(`${dateStr}T${timeStr}`))
  
  return `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')} ${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}:${String(dateObj.getUTCSeconds()).padStart(2, '0')}`
}

export function timeNow() {
  const now = new Date()
  
  $("#date").val(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`)
  $("#hour").val(String(now.getHours()).padStart(2, "0"))
  $("#minute").val(String(now.getMinutes()).padStart(2, "0"))
  $("#second").val(String(now.getSeconds()).padStart(2, "0"))
}

export function getLocation() {
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError)
}

function locationSuccess(pos) {
  $("#lat").val(Math.round(pos.coords.latitude * 1000) / 1000)
  $("#lon").val(Math.round(pos.coords.longitude * 1000) / 1000)
}

function locationError(err) {
  console.warn(`Error: ${err.message}`)
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
