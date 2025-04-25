import $ from "jquery"
import { API_URL } from "./constants.js"
import { initCommon } from "./shared.js"

$(function() {
  initCommon()
  document.getElementById("pointpopup").onclick=toggle("pointmsg")
  document.getElementById("herebutton").addEventListener("click", getLocation)
  document.getElementById("nowbutton").addEventListener("click", timeNow)
  document.getElementById("searchbutton").addEventListener("click", queryVisible)
})

function queryVisible() {
  var statusText = document.getElementById("statustext")
  var lat = document.getElementById("lat").value
  var lon = document.getElementById("lon").value
  var dateStr = document.getElementById("date").value
  var timeStr = document.getElementById("hour").value + ":" + document.getElementById("minute").value + ":" + document.getElementById("second").value
  var group = document.getElementById("group").value

  if (lat == "" || lon == "" || dateStr == "" || timeStr == "") {
    statusText.innerHTML = "Error: fill in all fields"
    return
  }

  var datetimeStr = parseDatetimeUTC(dateStr, timeStr)

  const queryData = {"lat": lat, "lon": lon, "time_utc": datetimeStr, "group": group}

  statusText.innerHTML = "Loading..."

  $.ajax({
    method: "GET",
    url: API_URL.visible,
    data: queryData,
    crossDomain: true,

    success: function(response) {
      statustext.innerHTML = ""
      populateVizTable(response)
      //resizeAngleTable() // doesn't work as intended
    },

    error: function() {
      statustext.innerHTML = "Error: query issue" 
    }
  })
}


function toggle(idmsg) {
  return function() {
    var popup = document.getElementById(idmsg)
    popup.classList.toggle("show")
  }
}
  
function populateVizTable(vizData) {
  var table = document.getElementById("viztable")
  
  // clears table in case there is anything there
  table.innerHTML = ""

  var row = null
  var cell = null
  var msg = null
  var div = null

  var zoom1 = document.createElement("span")
  zoom1.setAttribute("class", "pop material-symbols-outlined")
  zoom1.innerHTML = "zoom_in"

  // header row
  row = document.createElement("tr")
  cell = document.createElement("th")
  div = document.createElement("div")
  div.innerHTML = "Satellite"
  div.appendChild(zoom1)
  msg = document.createElement("span")
  msg.setAttribute("class", "first popuptext")
  msg.setAttribute("id", "satmsg")
  msg.innerHTML = "Yellow is sunlit... Grey is in shadow"
  div.appendChild(msg)
  div.setAttribute("class", "popup")
  div.onclick = toggle("satmsg")
  cell.appendChild(div)
  row.appendChild(cell)

  cell = document.createElement("th")
  div = document.createElement("div")
  div.innerHTML = "Elevation"
  div.appendChild(zoom1.cloneNode(true))
  msg = document.createElement("span")
  msg.setAttribute("class", "popuptext")
  msg.setAttribute("id", "elevationmsg")
  msg.innerHTML = "Number of degrees above horizon to find satellite"
  div.appendChild(msg)
  div.setAttribute("class", "popup")
  div.onclick = toggle("elevationmsg")
  cell.appendChild(div)
  row.appendChild(cell)
  
  cell = document.createElement("th")
  div = document.createElement("div")
  div.innerHTML = "Azimuth"
  div.appendChild(zoom1.cloneNode(true))
  msg = document.createElement("span")
  msg.setAttribute("class", "last popuptext")
  msg.setAttribute("id", "azimuthmsg")
  msg.innerHTML = "Number of degrees East of North to find satellite"
  div.appendChild(msg)
  div.setAttribute("class", "popup")
  div.onclick = toggle("azimuthmsg")
  cell.appendChild(div)
  row.appendChild(cell)

  table.appendChild(row)

  for (var i = 0; i < vizData.length; i++) {
    row = document.createElement("tr")

    // name
    cell = document.createElement("td")
    cell.innerHTML = vizData[i]["name"]
    if (vizData[i]["sunlit"]) {
      cell.setAttribute("class", "yes-sun-cell")
    }
    else {
      cell.setAttribute("class", "no-sun-cell")
    }
    row.appendChild(cell)

    // elevation
    cell = document.createElement("td")
    cell.innerHTML = vizData[i]["el"] + "&deg;"
    row.appendChild(cell)
    
    // azimuth
    cell = document.createElement("td")
    cell.innerHTML = vizData[i]["az"] + "&deg;"
    row.appendChild(cell)
    
    table.appendChild(row)
  }
}

/* doesn't work as intended
function resizeAngleTable() {
  var vizTableRow = document.getElementById("viztable").children[0]
  var angleTable = document.getElementById("angletable")
  var buttonCell = document.getElementById("buttoncell")
  var elevationCell = document.getElementById("elevationcell")
  var azimuthCell = document.getElementById("azimuthcell")

  // remove width from angleTable to let columns drive width
  angleTable.style.width = "unset"

  buttonCell.style.width = vizTableRow.children[0].offsetWidth + "px"
  elevationCell.style.width = vizTableRow.children[1].offsetWidth + "px"
  azimuthCell.style.width = vizTableRow.children[2].offsetWidth + "px"
} */


function parseDatetimeUTC(dateStr, timeStr) {
  var dateObj = new Date(Date.parse(dateStr + "T" + timeStr))

  var utcStr = dateObj.getUTCFullYear()
  utcStr += "-" + (dateObj.getUTCMonth() + 1)
  utcStr += "-" + dateObj.getUTCDate()
  utcStr += " " + dateObj.getUTCHours()
  utcStr += ":" + dateObj.getUTCMinutes()
  utcStr += ":" + dateObj.getUTCSeconds()

  return utcStr
}


function timeNow() {
  var dateField = document.getElementById("date")
  var hourField = document.getElementById("hour")
  var minuteField = document.getElementById("minute")
  var secondField = document.getElementById("second")

  var now = new Date()

  var dateValue = now.getFullYear()
  dateValue += "-" + (now.getMonth() + 1).toString().padStart(2, "0")
  dateValue += "-" + now.getDate().toString().padStart(2, "0")

  var hourValue = now.getHours().toString().padStart(2, "0")
  var minuteValue = now.getMinutes().toString().padStart(2, "0")
  var secondValue = now.getSeconds().toString().padStart(2, "0")

  dateField.value = dateValue
  hourField.value = hourValue
  minuteField.value = minuteValue
  secondField.value = secondValue
}


function getLocation() {
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError)
}


function locationSuccess(pos) {
  document.getElementById("lat").value = Math.round(pos.coords.latitude * 1000) / 1000
  document.getElementById("lon").value = Math.round(pos.coords.longitude * 1000) / 1000
}

function locationError(err) {
  console.warn("Error: ${err.message}")
}
