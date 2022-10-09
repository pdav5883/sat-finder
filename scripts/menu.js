$(document).ready(function() {

  // Variables
  var $nav = $('.navbar'),
      $popoverLink = $('[data-popover]'),
      $document = $(document)

  function init() {
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  init();
});

var navmenu =
'<ul class="navbar-list">' +
  '<li class="navbar-item"><a class="navbar-link" href="https://home.bearloves.rocks">Home</a></li>' +
  '<li class="navbar-item">' +
    '<a class="navbar-link" href="#" data-popover="#projectsPopover">sat-finder</a>' +
    '<div id="projectsPopover" class="popover">' +
      '<ul class="popover-list">' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/visible.html">Find Visible</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/nearby.html">Identify Object</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/calibrate.html">Calibrate</a>' +
        '</li>' +
      '</ul>' +
    '</div>' +
  '</li>' +
  '<li class="navbar-item">' +
    '<a class="navbar-link" href="#" data-popover="#aboutPopover">About</a>' +
    '<div id="aboutPopover" class="popover">' +
      '<ul class="popover-list">' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#">Overview</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#tidbits">Tidbits</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#visible">Find Visible</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#idobject">Identify Object</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#pointing">Pointing</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#calibration">Calibration</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="/about.html#site">Inner Workings</a>' +
        '</li>' +
        '<li class="popover-item">' +
          '<a class="popover-link" href="https://github.com/pdav5883/sat-finder">Github</a>' +
        '</li>' +
      '</ul>' +
    '</div>' +
  '</li>' +

'</ul>';
