import {WmConfigHolder} from "./config/config";
import {ConfigWindow} from "./config/configWindow";
import {ProgressWindow} from "./progress/progressWindow";
import {WmSearch} from "./progress/search";
import * as WM from "./globals";
import {ActionButton} from "./wmActionButton";
import "./wasabeeMarkers-mobile.scss"

window.plugin.wasabeeMarkers.init = function () {

  if (isSmartphone()) {
    $('body').addClass("mobile");
  }

  const config = WmConfigHolder.config.copy();
  const search = new WmSearch(config);
  const progress = new ProgressWindow(search);
  const actionButton = new ActionButton(search, progress);

  const statusListener = () => {
    progress.updateStatus(search.status);
    actionButton.updateStatus(search.status);
  }
  search.addEventListener('wasabee_markers:progress', statusListener);

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow(search, progress)
      .enable())
    .appendTo('#toolbox');

  window.map.addControl(actionButton);
}
