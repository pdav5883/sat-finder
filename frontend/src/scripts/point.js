import $ from "jquery"
import { Quaternion } from 'quaternion'

const rad = Math.PI / 180
let pointingStarted = false

$(function() {
  $("#startbutton").on("click", test_startPointing)
})


function test_startPointing() {
  if (pointingStarted) return
  pointingStarted = true

  // ios devices
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener("deviceorientation", test_handleOrientation, true)
        } else {
          console.warn("Orientation permission denied")
        }
      })
      .catch(console.error)
  } else {
    // non-ios devices
    window.addEventListener("deviceorientationabsolute", test_handleOrientation, true)
  }
}


function test_handleOrientation(event) {

  $("#status").text(`${event.absolute}`)
  $("#cellalpha").text(`${Math.round(event.alpha)}`)
  $("#cellbeta").text(`${Math.round(event.beta)}`)
  $("#cellgamma").text(`${Math.round(event.gamma)}`)
  if (event.webkitCompassHeading !== undefined) {
    $("#cellcompass").text(`${Math.round(event.webkitCompassHeading)}`)
    $("#cellcompassaccuracy").text(`${Math.round(event.webkitCompassAccuracy * 1000) / 1000}`)
    test_eulerToAzEl(-1 * event.webkitCompassHeading, event.beta, event.gamma)
  }
  else {
    $("#cellcompass").text(`N/A`)
    $("#cellcompassaccuracy").text(`N/A`)
    test_eulerToAzEl(event.alpha, event.beta, event.gamma)
  }
}

function test_eulerToAzEl(alpha, beta, gamma) {
  var v = test_eulerToVec(alpha, beta, gamma)
  var el = Math.asin(v[2]) / rad
  var az = Math.atan2(v[0], v[1]) / rad
  $("#cellv1").text(`${Math.round(v[0] * 1000) / 1000}`)
  $("#cellv2").text(`${Math.round(v[1] * 1000) / 1000}`)
  $("#cellv3").text(`${Math.round(v[2] * 1000) / 1000}`)
  $("#cellaz").text(`${Math.round(az)}`)
  $("#cellel").text(`${Math.round(el)}`)
}

function test_eulerToVec(alpha, beta, gamma) {
  const q = test_eulerToQuaternion(alpha, beta, gamma)
  const v = q.rotateVector([0, 0, -1])
  $("#cellq1").text(`${Math.round(q.x * 1000) / 1000}`)
  $("#cellq2").text(`${Math.round(q.y * 1000) / 1000}`)
  $("#cellq3").text(`${Math.round(q.z * 1000) / 1000}`)
  $("#cellq4").text(`${Math.round(q.w * 1000) / 1000}`)
  return v
}

function test_eulerToQuaternion(alpha, beta, gamma) {
  return Quaternion.fromEuler(alpha * rad, beta * rad, gamma * rad, 'ZXY')
}
