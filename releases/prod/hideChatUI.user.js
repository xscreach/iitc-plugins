// ==UserScript==
// @id            HideChatUI
// @name          Hide Chat UI
// @namespace     https://github.com/IITC-CE/ingress-intel-total-conversion
// @version       0.0.1.20231227235343-7eab5e8
// @updateURL     https://raw.githubusercontent.com/xscreach/iitc-plugins/master/releases/prod/hideChatUI.meta.js
// @downloadURL   https://raw.githubusercontent.com/xscreach/iitc-plugins/master/releases/prod/hideChatUI.user.js
// @description   Removes chat UI
// @author        screach
// @match         https://intel.ingress.com/*
// @match         https://intel-x.ingress.com/*
// @category      Misc
// @grant         none
// ==/UserScript==


function wrapper(plugin_info) {
  if (typeof window.plugin !== "function") {
    window.plugin = function () {};
  }

  window.plugin.hideChatUI = window.plugin.hideChatUI = {};
  window.plugin.hideChatUI.info = plugin_info;
  window.plugin.hideChatUI.info.pluginId = 'hideChatUI';
// Code injection
(()=>{"use strict";plugin.hideChatUI.init=function(){isSmartphone()||($("[id^=chat]").remove(),$(".leaflet-bottom.leaflet-left .leaflet-control:last").width("auto"),$(".leaflet-bottom.leaflet-left .leaflet-control:last").height("auto"))}})();
  function setup () {
    window.plugin.hideChatUI.init();
  }

  setup.info = plugin_info; //add the script info data to the function as a property
  if (!window.bootPlugins) {
    window.bootPlugins = [];
  }
  window.bootPlugins.push(setup);
  // if IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === "function") {
    setup();
  }
}

var script = document.createElement("script");
var info = {};
if (typeof GM_info !== "undefined" && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description,
  };
}

script.appendChild(
  document.createTextNode("(" + wrapper + ")(" + JSON.stringify(info) + ");")
);
(document.body || document.head || document.documentElement).appendChild(
  script
);
