import WasabeeLink from "./link";
import WasabeePortal from "./portal";
import type WasabeeOp from "./operation";
import WasabeeMarker from "./marker";
import WasabeeZone from "./zone";
declare type Change<T, K extends keyof T> = {
    id: string | number;
    props?: Partial<Pick<T, K>>;
    value?: T;
    type: "addition" | "edition" | "deletion";
};
declare type MarkerChange = Change<WasabeeMarker, "type" | "zone" | "order" | "assignedTo" | "state" | "comment" | "deltaminutes">;
declare type LinkChange = Change<WasabeeLink, "fromPortalId" | "toPortalId" | "color" | "zone" | "order" | "assignedTo" | "state" | "comment" | "deltaminutes">;
declare type PortalChange = Change<WasabeePortal, "hardness" | "comment">;
declare type ZoneChange = Change<WasabeeZone, "name" | "color" | "points">;
declare type OperationChange = Change<WasabeeOp, "name" | "comment" | "referencetime" | "color"> & {
    type: "edition";
    portals: PortalChange[];
    links: LinkChange[];
    markers: MarkerChange[];
    zones: ZoneChange[];
};
/**
 * @returns operation difference from `origin` to `current`
 */
export declare function operationChanges(origin: WasabeeOp, current: WasabeeOp): OperationChange;
/**
 *
 * @param origin Common ancestor
 * @param master Master copy that will be used to apply `follower` changes on
 * @param follower Our copy
 * @returns (`follower` - `origin`) - (`master` - `origin`) and conflicts
 */
export declare function computeRebaseChanges(origin: WasabeeOp, master: WasabeeOp, follower: WasabeeOp): {
    props: Partial<Pick<WasabeeOp, "name" | "color" | "comment" | "referencetime">>;
    portals: {
        result: Change<WasabeePortal, "comment" | "hardness">[];
        conflict: {
            id: string | number;
            type: "addition/addition" | "edition/edition" | "edition/deletion" | "deletion/edition";
            value?: WasabeePortal;
            master?: Change<WasabeePortal, "comment" | "hardness">;
            follower?: Change<WasabeePortal, "comment" | "hardness">;
        }[];
    };
    links: {
        result: Change<WasabeeLink, "state" | "color" | "zone" | "order" | "comment" | "fromPortalId" | "toPortalId" | "assignedTo" | "deltaminutes">[];
        conflict: {
            id: string | number;
            type: "addition/addition" | "edition/edition" | "edition/deletion" | "deletion/edition";
            value?: WasabeeLink;
            master?: Change<WasabeeLink, "state" | "color" | "zone" | "order" | "comment" | "fromPortalId" | "toPortalId" | "assignedTo" | "deltaminutes">;
            follower?: Change<WasabeeLink, "state" | "color" | "zone" | "order" | "comment" | "fromPortalId" | "toPortalId" | "assignedTo" | "deltaminutes">;
        }[];
    };
    markers: {
        result: Change<WasabeeMarker, "state" | "zone" | "order" | "comment" | "type" | "assignedTo" | "deltaminutes">[];
        conflict: {
            id: string | number;
            type: "addition/addition" | "edition/edition" | "edition/deletion" | "deletion/edition";
            value?: WasabeeMarker;
            master?: Change<WasabeeMarker, "state" | "zone" | "order" | "comment" | "type" | "assignedTo" | "deltaminutes">;
            follower?: Change<WasabeeMarker, "state" | "zone" | "order" | "comment" | "type" | "assignedTo" | "deltaminutes">;
        }[];
    };
    zones: {
        result: Change<WasabeeZone, "name" | "color" | "points">[];
        conflict: {
            id: string | number;
            type: "addition/addition" | "edition/edition" | "edition/deletion" | "deletion/edition";
            value?: WasabeeZone;
            master?: Change<WasabeeZone, "name" | "color" | "points">;
            follower?: Change<WasabeeZone, "name" | "color" | "points">;
        }[];
    };
};
/**
 * Add a value to all conflicts that matches the given op content
 */
export declare function defaultChangeChoice(masterOrCurrent: WasabeeOp, changes: ReturnType<typeof computeRebaseChanges>): void;
/**
 * Apply the given changes on `master`. Use `current` to add missing portals
 * and missing zones.
 */
export declare function applyRebaseChanges(master: WasabeeOp, current: WasabeeOp, changes: ReturnType<typeof computeRebaseChanges>): void;
export {};
