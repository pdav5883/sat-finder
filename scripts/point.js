window.onload = checkStatus
window.addEventListener("deviceorientation", handleOrientation, true)

function handleOrientation(event) {
  document.getElementById("cellA").innerHTML = Math.round(event.alpha)
  document.getElementById("cellB").innerHTML = Math.round(event.beta)
  document.getElementById("cellC").innerHTML = Math.round(event.gamma)
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
