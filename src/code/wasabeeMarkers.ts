import {WmConfigHolder} from "./config";
import {ConfigWindow} from "./config/configWindow";
import {ProgressWindow} from "./progress/progressWindow";
import {WmSearch} from "./progress/search";
import * as WM from "./types/globals";
import {ActionButton} from "./wmActionButton";

window.plugin.wasabeeMarkers.init = function () {

  const config = WmConfigHolder.config.copy();
  const search = new WmSearch(config);
  const progress = new ProgressWindow(search);

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow(search, progress)
      .enable())
    .appendTo('#toolbox');

  window.map.addControl(new ActionButton(search, progress));
}
