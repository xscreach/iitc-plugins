import WasabeeOp from "./model/operation";

export interface Wasabee {
    static: any;
    _inited: boolean;
    _selectedOp: WasabeeOp;
    _updateList: Map<string, number>;
    portalDetailQueue: PortalID[];
}
export {};
