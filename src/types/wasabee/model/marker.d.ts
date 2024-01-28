import Task from "./task";
export default class WasabeeMarker extends Task {
    portalId: PortalID;
    type: string;
    attributes?: any[];
    static get markerTypes(): Set<string>;
    static get constants(): {
        MARKER_TYPE_CAPTURE: string;
        MARKER_TYPE_DECAY: string;
        MARKER_TYPE_EXCLUDE: string;
        MARKER_TYPE_DESTROY: string;
        MARKER_TYPE_FARM: string;
        MARKER_TYPE_GOTO: string;
        MARKER_TYPE_KEY: string;
        MARKER_TYPE_LINK: string;
        MARKER_TYPE_MEETAGENT: string;
        MARKER_TYPE_OTHER: string;
        MARKER_TYPE_RECHARGE: string;
        MARKER_TYPE_UPGRADE: string;
        MARKER_TYPE_VIRUS: string;
    };
    constructor(obj: any);
    toJSON(): any;
    get friendlyType(): any;
    isDestructMarker(): boolean;
    static isDestructMarkerType(type: any): boolean;
}
