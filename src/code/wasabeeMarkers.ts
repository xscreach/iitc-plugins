import {ConfigWindow} from "./config/configWindow";
import * as WM from "./types/globals";

window.plugin.wasabeeMarkers.init = function () {

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow().enable())
    .appendTo('#toolbox');

  // window.map.addControl(new ActionButton());
}
