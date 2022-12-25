import {WmConfigHolder} from "./config/config";
import {ConfigWindow} from "./config/configWindow";
import * as WM from "./globals";
import {ProgressWindow} from "./progress/progressWindow";
import {WmSearch} from "./progress/search";
import "./wasabeeMarkers-mobile.scss"
import {ActionButton} from "./wmActionButton";

window.plugin.wasabeeMarkers.init = function () {

  if (isSmartphone()) {
    $('body').addClass("wm-mobile");
  }

  const config = WmConfigHolder.config.copy();
  const search = new WmSearch(config);
  window.plugin.wasabeeMarkers.search = search;

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow(search).showDialog())
    .appendTo('#toolbox');

  window.map.addControl(new ActionButton(search));

  createProgressWindow(search);
}

function createProgressWindow(search: WmSearch) {
  return new ProgressWindow(search);
}
