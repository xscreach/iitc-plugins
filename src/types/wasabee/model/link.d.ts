import type WasabeeOp from "./operation";
import Task from "./task";
export default class WasabeeLink extends Task {
    fromPortalId: PortalID;
    toPortalId: PortalID;
    color: string;
    constructor(obj: any);
    toJSON(): any;
    get portalId(): string;
    getLatLngs(operation: WasabeeOp): import("leaflet").LatLng[];
    setColor(color: string, operation: WasabeeOp): void;
    getColor(operation: WasabeeOp): string;
    length(operation: WasabeeOp): number;
}
