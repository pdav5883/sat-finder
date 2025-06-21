import $ from "jquery"
import { API_URL } from "./constants.js"
import { initCommon, getLocation, timeNow, parseDatetimeUTC, startPointing } from "./shared.js"


$(function() {
  initCommon()
  
  $("#pointingtext").hide()
  
  $("#pointingbutton").on("click", function() {
    startPointing()
    $("#pointingbutton").hide()
    $("#pointingtext").show()
  })
  
  // Set default values
  timeNow()
  getLocation()
  
  // Initialize toggle button
  $("#herebutton").on("click", getLocation)
  $("#nowbutton").on("click", timeNow)
  $("#searchbutton").on("click", function() {
    queryDirection()
  })

  $("#showTimeLocation").show()
  $("#timeLocationFields").hide()

  $("#showTimeLocation").on("click", function() {
    $("#showTimeLocation").hide()
    $("#timeLocationFields").show()
  })
})

function queryDirection() {
  const lat = $("#lat").val()
  const lon = $("#lon").val()

  // if haven't shown time/location, set to now when queried
  if ($("#timeLocationFields").is(":hidden")) {
    timeNow()
  }

  const dateStr = $("#date").val()
  const timeStr = `${$("#hour").val()}:${$("#minute").val()}:${$("#second").val()}`
  const elevation = parseInt($("#elevationcell").text().replace('°', ''))
  const azimuth = parseInt($("#azimuthcell").text().replace('°', ''))
  // const elevation = 25
  // const azimuth = 45

  if (!lat || !lon || !dateStr || !timeStr || !elevation || !azimuth) {
    $("#statustext").text("Error: fill in all fields")
    return
  }

  const datetimeStr = parseDatetimeUTC(dateStr, timeStr)
  const queryData = { 
    lat, 
    lon, 
    time_utc: datetimeStr, 
    el: elevation,
    az: azimuth,
    threshold: 45
  }

  $("#statustext").text("Loading...")

  $.ajax({
    method: "GET",
    url: API_URL.identify,
    data: queryData,
    crossDomain: true,
    success: function(response) {
      $("#statustext").text("   ")
      populateIdentifyTable(response)
    },
    error: function() {
      $("#statustext").text("Error: query issue")
    }
  })
}

// Table functions
// first row is the search direction
function populateIdentifyTable(identifyData) {
  const $table = $("#identifytable")
  // Remove all rows except the header and first data row
  $table.find("tr:gt(1)").remove()

  // Sort by descending error
  identifyData.sort((a, b) => {
    return a.err - b.err;
  })

  // First 5 are primary
  const primarySatellites = identifyData.slice(0, 5)
  const otherSatellites = identifyData.slice(5)

  // Create data rows for primary satellites
  primarySatellites.forEach(function(satellite) {
    const $row = $("<tr>")
    
    $row.append($("<td>").append(
      $("<a>")
            .attr("href", `https://www.n2yo.com/satellite/?s=${satellite.norad_id}`)
            .attr("target", "_blank")
            .text(satellite.name)
    ))
    $row.append($("<td>").text(`${satellite.el}°`))
    $row.append($("<td>").text(`${satellite.az}°`))
    $row.append($("<td>").text(`${satellite.err}°`))
    
    $table.append($row)
  })

  // Add show/hide button if there are other satellites and show_all is false
  if (otherSatellites.length > 0) {
    const $buttonRow = $("<tr>")
    const $buttonCell = $("<td>")
      .attr("colspan", "3")
      .addClass("text-center")
    
    const $button = $("<button>")
      .addClass("btn btn-sm btn-outline-secondary")
      .text("Show Other Satellites")
      .click(function() {
        const $this = $(this)
        const $otherRows = $table.find("tr.other-satellite")
        
        if ($this.text() === "Show Other Satellites") {
          // Create and show other satellite rows
          otherSatellites.forEach(function(satellite) {
            const $row = $("<tr>")
            
            $row.append($("<td>").append(
              $("<a>")
                    .attr("href", `https://www.n2yo.com/satellite/?s=${satellite.norad_id}`)
                    .attr("target", "_blank")
                    .text(satellite.name)
            ))
            $row.append($("<td>").text(`${satellite.el}°`))
            $row.append($("<td>").text(`${satellite.az}°`))
            $row.append($("<td>").text(`${satellite.err}°`))
            
            $table.append($row)
          })
          $this.text("Hide Other Satellites")
        } else {
          // Remove other satellite rows
          $otherRows.remove()
          $this.text("Show Other Satellites")
        }
      })
    
    $buttonCell.append($button)
    $buttonRow.append($buttonCell)
    $table.append($buttonRow)
  }
  $table.show()
}
