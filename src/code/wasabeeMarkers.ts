import {WmConfigHolder} from "./config/config";
import {ConfigWindow} from "./config/configWindow";
import * as WM from "./globals";
import {ProgressWindow} from "./progress/progressWindow";
import {WmSearch} from "./progress/search";
import "./wasabeeMarkers-mobile.scss"
import {ActionButton} from "./wmActionButton";

window.plugin.wasabeeMarkers.init = function () {

  if (isSmartphone()) {
    $('body').addClass("mobile");
  }

  const config = WmConfigHolder.config.copy();
  const search = new WmSearch(config);
  const progress = new ProgressWindow(search);
  const actionButton = new ActionButton(search, progress);

  search.addEventListener('wasabee_markers:progress', () => {
    progress.updateStatus(search.status);
    actionButton.updateStatus(search.status);
  });

  search.addEventListener('wasabee_markers:done', () => {
    if (search.config.autoUpload && search.status.added > 0 || search.status.removed > 0) {
      const uploadButtons = $('.wasabee-toolbar-upload');
      if (uploadButtons && uploadButtons.length > 0) {
        uploadButtons[0].click();
      }
    }
  });

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow(search, progress)
      .enable())
    .appendTo('#toolbox');

  window.map.addControl(actionButton);

  addHook("mapDataRefreshEnd", () => {
    if (getDataZoomForMapZoom(map.getZoom()) >= 15 && search.config.keepScanning) {
      search.start();
    }
  });
}
