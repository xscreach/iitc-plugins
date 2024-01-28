import WasabeePortal from "./model/portal";
import type WasabeeOp from "./model/operation";
import type WasabeeLink from "./model/link";
declare type Vec3 = [number, number, number];
interface LLC extends L.LatLng {
    _cartesian?: Vec3;
}
export declare function toLatLng(xyz: Vec3): LLC;
export declare function normalize(a: Vec3): Vec3;
export declare function dist2(a: Vec3, b: Vec3): number;
export declare function extendLatLngToLLC(ll: LLC): LLC;
export declare function fieldSign(a: WasabeePortal, b: WasabeePortal, c: WasabeePortal): 1 | -1;
export declare function portalInField(a: WasabeePortal, b: WasabeePortal, c: WasabeePortal, portal: WasabeePortal): boolean;
export declare function fieldCenter(a: WasabeePortal, b: WasabeePortal, c: WasabeePortal): LLC;
export declare function greatCircleArcIntersectByLatLngs(a0: LLC[], a1: LLC[]): boolean;
export declare function greatCircleArcIntersectByLatLngs(a0: LLC, a1: LLC, b0: LLC, b1: LLC): boolean;
export declare function testSelfBlock(incoming: WasabeeLink, operation: WasabeeOp): boolean;
export declare function checkAllLinks(): void;
export declare function initCrossLinks(): void;
export declare class GeodesicLine {
    lat1: number;
    lat2: number;
    lng1: number;
    lng2: number;
    sinLat1CosLat2: number;
    sinLat2CosLat1: number;
    cosLat1CosLat2SinDLng: number;
    constructor(start: L.LatLng, end: L.LatLng);
    isMeridian(): boolean;
    latAtLng(lng: number): number;
    bearing(): number;
}
export {};
