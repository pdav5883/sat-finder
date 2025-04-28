import $ from "jquery"
import { API_URL } from "./constants.js"
import { initCommon } from "./shared.js"

$(function() {
  initCommon()
  document.getElementById("herebutton").addEventListener("click", getLocation)
  document.getElementById("nowbutton").addEventListener("click", timeNow)
  document.getElementById("searchbutton").addEventListener("click", queryVisible)
  
  // Hide the table initially
  $("#viztable").hide()
})

function queryVisible() {
  const lat = $("#lat").val()
  const lon = $("#lon").val()
  const dateStr = $("#date").val()
  const timeStr = `${$("#hour").val()}:${$("#minute").val()}:${$("#second").val()}`
  const group = $("#group").val()

  if (!lat || !lon || !dateStr || !timeStr) {
    $("#statustext").text("Error: fill in all fields")
    return
  }

  const datetimeStr = parseDatetimeUTC(dateStr, timeStr)
  const queryData = { lat, lon, time_utc: datetimeStr, group }

  $("#statustext").text("Loading...")

  $.ajax({
    method: "GET",
    url: API_URL.visible,
    data: queryData,
    crossDomain: true,
    success: function(response) {
      $("#statustext").text("   ")
      populateVizTable(response)
    },
    error: function() {
      $("#statustext").text("Error: query issue")
    }
  })
}

// Table functions
function populateVizTable(vizData) {
  const $table = $("#viztable")
  // Remove all rows except the header
  $table.find("tr:not(:first)").remove()

  // Sort by sunlit status (true first) and then by elevation in descending order
  vizData.sort((a, b) => {
    if (a.sunlit !== b.sunlit) {
      return b.sunlit - a.sunlit; // true (1) comes before false (0)
    }
    return b.el - a.el;
  })

  // Filter for primary satellites (sunlit and elevation > 10)
  const primarySatellites = vizData.filter(sat => sat.sunlit && sat.el > 10)
  const otherSatellites = vizData.filter(sat => !(sat.sunlit && sat.el > 10))

  // Create data rows for primary satellites
  primarySatellites.forEach(function(satellite) {
    const $row = $("<tr>")
      .addClass(satellite.sunlit ? "table-warning" : "table-secondary")
    
    $row.append($("<td>").append(
      $("<a>")
        // .attr("href", `https://db.satnogs.org/satellite/${satellite.norad_id}`)
        .attr("href", `https://www.n2yo.com/satellite/?s=${satellite.norad_id}`)
        .attr("target", "_blank")
        .text(satellite.name)
    ))
    $row.append($("<td>").text(`${satellite.el}°`))
    $row.append($("<td>").text(`${satellite.az}°`))
    
    $table.append($row)
  })

  // Add show/hide button if there are other satellites
  if (otherSatellites.length > 0) {
    const $buttonRow = $("<tr>")
    const $buttonCell = $("<td>")
      .attr("colspan", "3")
      .addClass("text-center")
    
    const $button = $("<button>")
      .addClass("btn btn-sm btn-outline-secondary")
      .text("Show Non-Viewable Satellites")
      .click(function() {
        const $this = $(this)
        const $otherRows = $table.find("tr.other-satellite")
        
        if ($this.text() === "Show Non-Viewable Satellites") {
          // Create and show other satellite rows
          otherSatellites.forEach(function(satellite) {
            const $row = $("<tr>")
              .addClass("other-satellite " + (satellite.sunlit ? "table-warning" : "table-secondary"))
            
            $row.append($("<td>").append(
              $("<a>")
                // .attr("href", `https://db.satnogs.org/satellite/${satellite.norad_id}`)
                .attr("href", `https://www.n2yo.com/satellite/?s=${satellite.norad_id}`)
                .attr("target", "_blank")
                .text(satellite.name)
            ))
            $row.append($("<td>").text(`${satellite.el}°`))
            $row.append($("<td>").text(`${satellite.az}°`))
            
            $table.append($row)
          })
          $this.text("Hide Non-Viewable Satellites")
        } else {
          // Remove other satellite rows
          $otherRows.remove()
          $this.text("Show Non-Viewable Satellites")
        }
      })
    
    $buttonCell.append($button)
    $buttonRow.append($buttonCell)
    $table.append($buttonRow)
  }

  $table.show()
}

// Utility functions
function parseDatetimeUTC(dateStr, timeStr) {
  const dateObj = new Date(Date.parse(`${dateStr}T${timeStr}`))
  
  return `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')} ${String(dateObj.getUTCHours()).padStart(2, '0')}:${String(dateObj.getUTCMinutes()).padStart(2, '0')}:${String(dateObj.getUTCSeconds()).padStart(2, '0')}`
}

function timeNow() {
  const now = new Date()
  
  $("#date").val(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`)
  $("#hour").val(String(now.getHours()).padStart(2, "0"))
  $("#minute").val(String(now.getMinutes()).padStart(2, "0"))
  $("#second").val(String(now.getSeconds()).padStart(2, "0"))
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError)
}

function locationSuccess(pos) {
  $("#lat").val(Math.round(pos.coords.latitude * 1000) / 1000)
  $("#lon").val(Math.round(pos.coords.longitude * 1000) / 1000)
}

function locationError(err) {
  console.warn(`Error: ${err.message}`)
}