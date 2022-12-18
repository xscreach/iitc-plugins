export const PLUGIN_NAME = "Wasabee Markers";
export const PLUGIN_CODE = "wasabeeMarkers";
export const PLUGIN_CSS_BASE = "wasabee-markers";

export enum WasabeeMarker {
  "CapturePortalMarker",
  "LetDecayPortalAlert",
  "ExcludeMarker",
  "DestroyPortalAlert",
  "FarmPortalMarker",
  "GotoPortalMarker",
  "GetKeyPortalMarker",
  "CreateLinkAlert",
  "MeetAgentPortalMarker",
  "OtherPortalAlert",
  "RechargePortalAlert",
  "UpgradePortalAlert",
  "UseVirusPortalAlert"
}

export class Options {
  [key: string]: any
}
