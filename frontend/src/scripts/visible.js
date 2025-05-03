import $ from "jquery"
import { API_URL } from "./constants.js"
import { initCommon, initPointing, getLocation, timeNow, parseDatetimeUTC } from "./shared.js"


$(function() {
  initCommon()
  initPointing()
  
  // Set default values
  timeNow()
  getLocation()
  
  // Initialize toggle button
  
  
  $("#herebutton").on("click", getLocation)
  $("#nowbutton").on("click", timeNow)
  $("#searchbutton").on("click", queryVisible)
  
  // Hide the table initially
  $("#viztable").hide()

  $("#showTimeLocation").show()
  $("#timeLocationFields").hide()

  $("#showTimeLocation").on("click", function() {
    $("#showTimeLocation").hide()
    $("#timeLocationFields").show()
  })
})

function queryVisible() {
  const lat = $("#lat").val()
  const lon = $("#lon").val()

  // if haven't shown time/location, set to now when queried
  if ($("#timeLocationFields").is(":hidden")) {
    timeNow()
  }

  const dateStr = $("#date").val()
  const timeStr = `${$("#hour").val()}:${$("#minute").val()}:${$("#second").val()}`
  const group = $("#group").val()
  const show_all = $("#showAll").is(":checked")

  if (!lat || !lon || !dateStr || !timeStr) {
    $("#statustext").text("Error: fill in all fields")
    return
  }

  const datetimeStr = parseDatetimeUTC(dateStr, timeStr)
  const queryData = { 
    lat, 
    lon, 
    time_utc: datetimeStr, 
    group,
    show_all
  }

  $("#statustext").text("Loading...")

  $.ajax({
    method: "GET",
    url: API_URL.visible,
    data: queryData,
    crossDomain: true,
    success: function(response) {
      $("#statustext").text("   ")
      populateVizTable(response, group, show_all)
    },
    error: function() {
      $("#statustext").text("Error: query issue")
    }
  })
}

// Table functions
function populateVizTable(vizData, group, show_all) {
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

  // Filter for primary satellites (sunlit and elevation > 10, or body)
  const primarySatellites = group === "bodies" 
    ? vizData 
    : vizData.filter(sat => sat.sunlit && sat.el > 10)
  const otherSatellites = group === "bodies" 
    ? [] 
    : vizData.filter(sat => !(sat.sunlit && sat.el > 10))

  // Create data rows for primary satellites
  primarySatellites.forEach(function(satellite) {
    const $row = $("<tr>")
    if (group !== "bodies") {
      $row.addClass(satellite.sunlit ? "table-warning" : "table-secondary")
    }
    
    $row.append($("<td>").append(
      group === "bodies" 
        ? satellite.name
        : $("<a>")
            .attr("href", `https://www.n2yo.com/satellite/?s=${satellite.norad_id}`)
            .attr("target", "_blank")
            .text(satellite.name)
    ))
    $row.append($("<td>").text(`${satellite.el}°`))
    $row.append($("<td>").text(`${satellite.az}°`))
    
    $table.append($row)
  })

  // Add show/hide button if there are other satellites and show_all is false
  if (otherSatellites.length > 0 && !show_all) {
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
            if (group !== "bodies") {
              $row.addClass("other-satellite " + (satellite.sunlit ? "table-warning" : "table-secondary"))
            } else {
              $row.addClass("other-satellite")
            }
            
            $row.append($("<td>").append(
              group === "bodies"
                ? satellite.name
                : $("<a>")
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
  } else if (otherSatellites.length > 0) {
    // If show_all is true, show all satellites without the button
    otherSatellites.forEach(function(satellite) {
      const $row = $("<tr>")
      if (group !== "bodies") {
        $row.addClass(satellite.sunlit ? "table-warning" : "table-secondary")
      }
      
      $row.append($("<td>").append(
        group === "bodies"
          ? satellite.name
          : $("<a>")
              .attr("href", `https://www.n2yo.com/satellite/?s=${satellite.norad_id}`)
              .attr("target", "_blank")
              .text(satellite.name)
      ))
      $row.append($("<td>").text(`${satellite.el}°`))
      $row.append($("<td>").text(`${satellite.az}°`))
      
      $table.append($row)
    })
  }

  $table.show()
}
