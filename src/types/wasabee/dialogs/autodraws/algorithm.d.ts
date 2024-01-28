import type WasabeePortal from "../../model/portal";
declare type Poset<T> = Map<T, T[]>;
/**
  given two anchor, build a map that shows which and how many portals are covered by each possible field by guid
  note: a portal always covers itself
*/
export declare function buildPoset(anchor1: WasabeePortal, anchor2: WasabeePortal, portals: WasabeePortal[]): Poset<string>[];
/**
  given a poset, find the longest sequence p1,p2,...pk such that poset(p2) contains p1, poset(p3) contains p2 etc
  that minimizes the flight distance
  notes:
  - the result is an empty sequence only if the poset is empty or if poset(p) is empty for any p
  - if the poset is given by buildPOSet, the first element is the guid of a portal that doesn't cover any other portal,
    and the last element is the portal that covers all portals of the sequence and isn't covered by any other portal
    (inner to outer)
*/
export declare function longestSequence<T>(poset: Poset<T>, start?: T, dist?: (a: T, b: T) => number): T[];
/** Returns longest spines from each side of the base `pOne/pTwo` */
export declare function getSignedSpine(pOne: WasabeePortal, pTwo: WasabeePortal, portals: WasabeePortal[], bothSide?: boolean): WasabeePortal[][];
/** Returns bearing of link a-p */
export declare function angle(a: WasabeePortal, p: WasabeePortal): number;
/** Sort portals by angle from anchor */
export declare function sortPortalsByAngle(anchor: WasabeePortal, portals: WasabeePortal[]): WasabeePortal[];
/**
 * Select portals in the interval start-end wrt their angle from anchor.
 * The portals must be sorted by angle and contains start/end
 */
export declare function selectAngleInterval(anchor: WasabeePortal, portalsSorted: WasabeePortal[], start: WasabeePortal, end: WasabeePortal): WasabeePortal[];
export {};
