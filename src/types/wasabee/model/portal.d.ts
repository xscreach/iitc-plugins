import type { LatLng } from "leaflet";
export default class WasabeePortal {
    id: PortalID;
    name: string;
    lat: string;
    lng: string;
    comment: string;
    hardness: string;
    _latLng: LatLng;
    constructor(obj: any);
    toJSON(): {
        id: string;
        name: string;
        lat: string;
        lng: string;
        comment: string;
        hardness: string;
    };
    get latLng(): LatLng;
    static fake(lat: number | string, lng: number | string, id?: string, name?: string): WasabeePortal;
    get faked(): boolean;
    get loading(): boolean;
    get pureFaked(): boolean;
}
