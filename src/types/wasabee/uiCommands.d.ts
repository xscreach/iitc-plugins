import WasabeeOp from "./model/operation";
import WasabeePortal from "./model/portal";
import WasabeeMarker from "./model/marker";
export declare function addPortal(operation: WasabeeOp, portal: WasabeePortal): void;
export declare function swapPortal(operation: WasabeeOp, portal: WasabeePortal): void;
export declare function deletePortal(operation: WasabeeOp, portal: WasabeePortal): void;
export declare function deleteMarker(operation: WasabeeOp, marker: WasabeeMarker, portal: WasabeePortal): void;
export declare function clearAllItems(operation: WasabeeOp): void;
export declare function clearAllLinks(operation: WasabeeOp): void;
export declare function clearAllMarkers(operation: WasabeeOp): void;
export declare function listenForAddedPortals(newPortal: any): void;
export declare function listenForPortalDetails(e: any): void;
export declare function getPortalDetails(guid: any): void;
export declare function loadFaked(operation: WasabeeOp, force?: boolean): void;
export declare function loadBlockerFaked(operation: WasabeeOp, force?: boolean): Promise<void>;
export declare function sendLocation(): void;
export declare function getAllPortalsOnScreen(operation: WasabeeOp): any[];
export declare function getAllPortalsLinked(operation: WasabeeOp, originPortal: WasabeePortal): any[];
export declare function blockerAutomark(operation: WasabeeOp, first?: boolean): Promise<void>;
export declare function zoomToOperation(operation: WasabeeOp): void;
export declare function updateLocalOp(local: any, remote: any): Promise<boolean>;
export declare function fullSync(): Promise<void>;
export declare function syncOp(opID: OpID): Promise<void>;
export declare function deleteLocalOp(opname: string, opid: OpID): void;
export declare function clearAllData(): void;
export declare function setMarkersToZones(): void;
export declare function setLinksToZones(): void;
