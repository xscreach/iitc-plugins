import {WmConfigHolder} from "./config";
import {ConfigWindow} from "./config/configWindow";
import {WmSearch} from "./progress/search";
import * as WM from "./types/globals";

window.plugin.wasabeeMarkers.init = function () {

  const config = WmConfigHolder.config.copy();
  const search = new WmSearch(config);

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow(search).enable())
    .appendTo('#toolbox');

  // window.map.addControl(new ActionButton());
}
