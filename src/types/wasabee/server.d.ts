import WasabeeOp from "./model/operation";
import type { TaskState } from "./model/task";
import type WasabeePortal from "./model/portal";
import type WasabeeAgent from "./model/agent";
import type WasabeeTeam from "./model/team";
import type { WDKey } from "./wd";
import type Task from "./model/task";
import type WasabeeLink from "./model/link";
import type WasabeeMarker from "./model/marker";
export default function (): any;
export declare function GetWasabeeServer(): any;
export declare function GetUpdateList(): any;
export declare function SetWasabeeServer(server: any): void;
interface IServerStatus {
    status: string;
}
interface IServerUpdate extends IServerStatus {
    updateID: string;
}
export declare function loadConfig(): Promise<unknown>;
export declare function SendAccessTokenAsync(accessToken: any): Promise<unknown>;
export declare function logoutPromise(): Promise<unknown>;
export declare function oneTimeToken(token: any): Promise<unknown>;
/**** me & d ****/
export declare function mePromise(): Promise<unknown>;
export declare function dKeylistPromise(): Promise<{
    DefensiveKeys: WDKey[];
}>;
export declare function leaveTeamPromise(teamID: TeamID): Promise<unknown>;
export declare function locationPromise(lat: number, lng: number): Promise<unknown>;
export declare function setIntelID(name: string, faction: string, querytoken: string): Promise<unknown>;
export declare function SetTeamState(teamID: TeamID, state: "On" | "Off"): Promise<unknown>;
export declare function SetTeamShareWD(teamID: TeamID, state: "On" | "Off"): Promise<unknown>;
export declare function SetTeamLoadWD(teamID: TeamID, state: "On" | "Off"): Promise<unknown>;
export declare function dKeyPromise(json: string): Promise<unknown>;
export declare function dKeyBulkPromise(json: string): Promise<unknown>;
export declare function agentPromise(GID: GoogleID): Promise<WasabeeAgent>;
export declare function targetPromise(agentID: GoogleID, portal: WasabeePortal, type?: string): Promise<unknown>;
export declare function teamPromise(teamid: TeamID): Promise<WasabeeTeam>;
export declare function sendAnnounce(teamID: TeamID, message: string): Promise<unknown>;
export declare function pullRocks(teamID: TeamID): Promise<unknown>;
export declare function newTeamPromise(name: string): Promise<unknown>;
export declare function renameTeamPromise(teamID: TeamID, name: string): Promise<unknown>;
export declare function deleteTeamPromise(teamID: TeamID): Promise<unknown>;
export declare function changeTeamOwnerPromise(teamID: TeamID, newOwner: GoogleID): Promise<unknown>;
export declare function addAgentToTeamPromise(agentID: GoogleID, teamID: TeamID): Promise<unknown>;
export declare function removeAgentFromTeamPromise(agentID: GoogleID, teamID: TeamID): Promise<unknown>;
export declare function rocksPromise(teamID: TeamID, community: string, apikey: string): Promise<unknown>;
export declare function setAgentTeamSquadPromise(agentID: GoogleID, teamID: TeamID, squad: string): Promise<unknown>;
export declare function createJoinLinkPromise(teamID: TeamID): Promise<{
    Key: string;
}>;
export declare function deleteJoinLinkPromise(teamID: TeamID): Promise<unknown>;
export declare function opPromise(opID: OpID): Promise<WasabeeOp>;
export declare function uploadOpPromise(): Promise<WasabeeOp>;
export declare function updateOpPromise(operation: WasabeeOp): Promise<boolean>;
export declare function deleteOpPromise(opID: OpID): Promise<unknown>;
export declare function setOpInfo(opID: OpID, info: string): Promise<unknown>;
export declare function addPermPromise(opID: OpID, teamID: TeamID, role: string, zone: ZoneID): Promise<unknown>;
export declare function delPermPromise(opID: OpID, teamID: TeamID, role: string, zone: ZoneID): Promise<unknown>;
export declare function getLinkPromise(opID: OpID, taskID: TaskID): Promise<WasabeeLink>;
export declare function getMarkerPromise(opID: OpID, taskID: TaskID): Promise<WasabeeMarker>;
export declare function taskGetPromise(opID: OpID, taskID: TaskID): Promise<Task>;
export declare function taskOrderPromise(opID: OpID, taskID: TaskID, order: number): Promise<IServerUpdate>;
export declare function taskAssignPromise(opID: OpID, taskID: TaskID, gids: GoogleID[]): Promise<IServerUpdate>;
export declare function taskDeleteAssignPromise(opID: OpID, taskID: TaskID): Promise<IServerUpdate>;
export declare function taskCommentPromise(opID: OpID, taskID: TaskID, comment: string): Promise<IServerUpdate>;
export declare function taskCompletePromise(opID: OpID, taskID: TaskID, complete: boolean): Promise<IServerUpdate>;
export declare function taskAckPromise(opID: OpID, taskID: TaskID): Promise<IServerUpdate>;
export declare function taskRejectPromise(opID: OpID, taskID: TaskID): Promise<IServerUpdate>;
export declare function taskClaimPromise(opID: OpID, taskID: TaskID): Promise<IServerUpdate>;
export declare function taskZonePromise(opID: OpID, taskID: TaskID, zone: ZoneID): Promise<IServerUpdate>;
export declare function taskDeltaPromise(opID: OpID, taskID: TaskID, delta: number): Promise<IServerUpdate>;
export declare function taskAddDependPromise(opID: OpID, taskID: TaskID, dep: TaskID): Promise<IServerUpdate>;
export declare function taskDelDependPromise(opID: OpID, taskID: TaskID, dep: TaskID): Promise<IServerUpdate>;
export declare function assignMarkerPromise(opID: OpID, markerID: MarkerID, agentID: GoogleID): Promise<unknown>;
export declare function assignLinkPromise(opID: OpID, linkID: LinkID, agentID: GoogleID): Promise<unknown>;
export declare function SetMarkerState(opID: OpID, markerID: MarkerID, state: TaskState): Promise<unknown>;
export declare function SetLinkState(opID: OpID, linkID: LinkID, state: TaskState): Promise<unknown>;
export declare function reverseLinkDirection(opID: OpID, linkID: LinkID): Promise<unknown>;
export declare function setMarkerComment(opID: OpID, markerID: MarkerID, comment: string): Promise<unknown>;
export declare function setLinkComment(opID: OpID, linkID: LinkID, desc: string): Promise<unknown>;
export declare function setLinkZone(opID: OpID, linkID: LinkID, zone: ZoneID): Promise<unknown>;
export declare function setMarkerZone(opID: OpID, markerID: MarkerID, zone: ZoneID): Promise<unknown>;
export declare function opKeyPromise(opID: OpID, portalID: PortalID, onhand: number, capsule: string): Promise<unknown>;
export declare function sendTokenToWasabee(token: string): Promise<unknown>;
export declare function getCustomTokenFromServer(): Promise<unknown>;
export {};
