import type {LatLng} from "leaflet";

export function addMarker(markerType: string, guid: string, latLng: LatLng, title: string) {
  if (plugin.wasabee) {
    const rawPortal = {
      id: guid,
      lat: latLng.lat,
      lng: latLng.lng,
      name: title || guid,
      comment: '',
      hardness: '',
    };

    plugin.wasabee._selectedOp.convertPortalsToObjs([rawPortal]).forEach((p: any) => {
      if (!plugin.wasabee._selectedOp.containsMarker(p, markerType)) {
        plugin.wasabee._selectedOp.addPortal(p);
        plugin.wasabee._selectedOp.addMarker(markerType, p);
      }
    });
  }
  // else {
  //   L.circle(latLng, { radius: 15, weight: 5, color: 'red', fill: false}).addTo(map);
  // }
}

export function removeMarker(marker: any) {
  if (plugin.wasabee && marker) {
    plugin.wasabee._selectedOp.removeMarker(marker);
  }
}

export function getPortalMarkers(guid: string) {
  if (plugin.wasabee) {
    const markers = plugin.wasabee._selectedOp.markers;
    return markers.filter((marker: { portalId: string }) => marker.portalId === guid);
  }
}

export function getMarker(markerType: string, guid: string) {
  const portalMarkers = getPortalMarkers(guid);
  return portalMarkers && portalMarkers.find((marker: { type: string; }) => marker.type === markerType);
}

export function getWasabeeStrings() {
  let strings: { [key: string]: string } = {};
  if (plugin.wasabee?.static.strings) {
    const language = localStorage['wasabee-language'] || 'English';
    strings = plugin.wasabee?.static.strings[language];
  }
  return strings;
}

export function getMarkerTypeName(markerType: string): string {
  return getWasabeeStrings()[markerType] || markerType;
}


