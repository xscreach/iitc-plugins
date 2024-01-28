import type WasabeeLink from "../../model/link";
import type WasabeeOp from "../../model/operation";
import type WasabeePortal from "../../model/portal";
/** Insert in `op` the links after the order `order`  */
export declare function insertLinks(op: WasabeeOp, links: WasabeeLink[], order: number, noShift?: boolean): number;
/** Insert a spine in `op` after order `order` */
export declare function drawSpine(op: WasabeeOp, anchor1: WasabeePortal, anchor2: WasabeePortal, spine: WasabeePortal[], order: number, options?: {
    backlink?: boolean;
    commentPrefix?: string;
    noShift?: boolean;
}): number;
