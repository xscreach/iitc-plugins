import {WmConfigHolder} from "./config/config";
import {ConfigWindow} from "./config/configWindow";
import * as WM from "./wm-globals";
import {ProgressWindow} from "./progress/progressWindow";
import {WmSearch} from "./progress/search";
import "./wasabeeMarkers-mobile.scss"
import {WasabeeActionButton} from "./wmActionButton";

plugin[WM.PLUGIN_CODE].info.changelog = [
  {
    version: '0.1.1',
    changes: [
      'Fixed mod/reso slot/upgrade search'
    ]
  },
  {
    version: '0.1.0',
    changes: [
      'Ability to enable/disable rules'
    ]
  },{
    version: '0.0.9',
    changes: [
      'Fixes ITO search'
    ]
  },
  {
    version: '0.0.8',
    changes: [
      'Remove only markers with configured types - Do not remove user-added markers with different type',
      'Option to \'keep "completed" markers on map\''
    ]
  }
]

plugin[WM.PLUGIN_CODE].init = function () {

  if (isSmartphone()) {
    $('body').addClass("wm-mobile");
  }

  const config = WmConfigHolder.config.copy();
  const search = new WmSearch(config);
  plugin[WM.PLUGIN_CODE].search = search;

  $('<a>')
    .html(WM.PLUGIN_NAME)
    .attr('title', WM.PLUGIN_NAME)
    .on("click", () => new ConfigWindow(search).showDialog())
    .appendTo('#toolbox');

  map.addControl(new WasabeeActionButton(search));

  createProgressWindow(search);
}

function createProgressWindow(search: WmSearch) {
  return new ProgressWindow(search);
}
