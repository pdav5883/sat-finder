let api_url = "https://7h2qtbrkl1.execute-api.us-east-1.amazonaws.com/visible"


function queryVisible() {
  var statusText = document.getElementById("statustext")
  var lat = document.getElementById("lat").value
  var lon = document.getElementById("lon").value
  var dateStr = document.getElementById("date").value
  var timeStr = document.getElementById("hour").value + ":" + document.getElementById("minute").value + ":" + document.getElementById("second").value

  if (lat == "" || lon == "" || dateStr == "" || timeStr == "") {
    statusText.innerHTML = "Error: fill in all fields"
    return
  }

  var datetimeStr = parseDatetimeUTC(dateStr, timeStr)

  queryData = {"lat": lat, "lon": lon, "time_utc": datetimeStr}

  statusText.innerHTML = "Loading..."

  $.ajax({
    method: "GET",
    url: api_url,
    data: queryData,
    crossDomain: true,

    success: function(response) {
      statustext.innerHTML = ""
      populateTable(response)
    },

    error: function() {
      statustext.innerHTML = "Error: query issue" 
    }
  })
}


function populateTable(vizData) {
  var table = document.getElementById("viztable")
  
  // clears table in case there is anything there
  table.innerHTML = ""

  var row = null
  var cell = null

  // header row
  row = document.createElement("tr")
  cell = document.createElement("th")
  cell.innerHTML = "Satellite"
  row.appendChild(cell)

  //cell = document.createElement("th")
  //cell.innerHTML = "Sunlit"
  //row.appendChild(cell)
  
  //cell = document.createElement("th")
  //cell.innerHTML = "Sun Phase"
  //row.appendChild(cell)
  
  cell = document.createElement("th")
  cell.innerHTML = "Elevation"

  row.appendChild(cell)
  
  cell = document.createElement("th")
  cell.innerHTML = "Azimuth"
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

    // sunlit
    //cell = document.createElement("td")
    //if (vizData[i]["sunlit"]) {
    //  cell.setAttribute("class", "yes-sun-cell")
    //}
    //else {
    //  cell.setAttribute("class", "no-sun-cell")
    //}
    //row.appendChild(cell)
    
    // sun phase
    //cell = document.createElement("td")
    //cell.innerHTML = vizData[i]["sunphase"] + "&deg;"
    //row.appendChild(cell)
    
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
