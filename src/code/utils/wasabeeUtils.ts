import type {LatLng} from "leaflet";

export function addMarker(markerType: string, guid: string, latLng: LatLng, title: string) {
  if (plugin.wasabee) {
    const rawPortal = {
      id: guid,
      lat: latLng.lat,
      lng: latLng.lng,
      name: title,
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
}

export function removeMarker(marker: any) {
  if (plugin.wasabee && marker) {
    plugin.wasabee._selectedOp.removeMarker(marker);
  }
}

export function getMarker(markerType: string, guid: string) {
  if (plugin.wasabee) {
    const markers = plugin.wasabee._selectedOp.markers;
    return markers.find((marker: { portalId: string; type: string; }) => marker.portalId === guid && marker.type === markerType);
  }
}


