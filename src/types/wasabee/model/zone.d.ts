export default class WasabeeZone {
    id: ZoneID;
    name: string;
    color: string;
    points: ZonePoint[];
    constructor(obj: any);
    toJSON(): {
        id: number;
        name: string;
        color: string;
        points: ZonePoint[];
    };
    contains(latlng: {
        lat: number;
        lng: number;
    }): boolean;
}
export declare class ZonePoint {
    position: number;
    lat: number;
    lng: number;
    constructor(obj: any);
}
