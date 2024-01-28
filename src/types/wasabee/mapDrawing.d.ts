import WasabeeOp from "./model/operation";
import type { PathOptions } from "leaflet";
export declare function drawMap(): void;
export declare function drawBackgroundOps(opIDs?: OpID[]): Promise<void>;
export declare function drawBackgroundOp(operation?: WasabeeOp, layerGroup?: L.LayerGroup, style?: PathOptions): void;
export declare function drawAgents(): Promise<void>;
export declare function drawSingleTeam(teamID: TeamID, layerMap?: Map<GoogleID, number>, alreadyDone?: GoogleID[]): Promise<any[]>;
export declare function drawSingleAgent(gid: GoogleID): Promise<void>;
