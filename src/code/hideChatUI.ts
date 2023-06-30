
plugin['hideChatUI'].init = function () {
  if (!isSmartphone()) {
    $("[id^=chat]").remove();
    $('.leaflet-bottom.leaflet-left .leaflet-control:last').width('auto');
    $('.leaflet-bottom.leaflet-left .leaflet-control:last').height('auto');
  }
}
