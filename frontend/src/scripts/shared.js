import $ from "jquery"

import "../styles/custom.css"
import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap-icons/font/bootstrap-icons.css'


export function initCommon() {
  $(function() {
    $.get("assets/nav.html", navbar => {
      $("#nav-placeholder").replaceWith(navbar);
    });
  });
}

// var navmenu =
// '<ul class="navbar-list">' +
//   '<li class="navbar-item"><a class="navbar-link" href="https://home.bearloves.rocks">Home</a></li>' +
//   '<li class="navbar-item">' +
//     '<a class="navbar-link" href="#" data-popover="#projectsPopover">sat-finder</a>' +
//     '<div id="projectsPopover" class="popover">' +
//       '<ul class="popover-list">' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/visible.html">Find Visible</a>' +
//         '</li>' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/nearby.html">Identify Object</a>' +
//         '</li>' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/calibrate.html">Calibrate</a>' +
//         '</li>' +
//       '</ul>' +
//     '</div>' +
//   '</li>' +
//   '<li class="navbar-item">' +
//     '<a class="navbar-link" href="#" data-popover="#aboutPopover">About</a>' +
//     '<div id="aboutPopover" class="popover">' +
//       '<ul class="popover-list">' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/about.html#">Overview</a>' +
//         '</li>' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/about.html#tidbits">Tidbits</a>' +
//         '</li>' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/about.html#visible">Find Visible</a>' +
//         '</li>' +
//         /*'<li class="popover-item">' +
//           '<a class="popover-link" href="/about.html#idobject">Identify Object</a>' +
//         '</li>' + */
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/about.html#pointing">Pointing</a>' +
//         '</li>' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="/about.html#site">Inner Workings</a>' +
//         '</li>' +
//         '<li class="popover-item">' +
//           '<a class="popover-link" href="https://github.com/pdav5883/sat-finder">Github</a>' +
//         '</li>' +
//       '</ul>' +
//     '</div>' +
//   '</li>' +

// '</ul>';