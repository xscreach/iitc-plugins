interface BaseAgent {
    id: GoogleID;
    name: string;
    intelname?: string;
    intelfaction: "unset" | "ENLIGHTENED" | "RESISTANCE";
    communityname?: string;
    pic?: string;
    lat: number;
    lng: number;
    date: string;
}
interface RockAgent extends BaseAgent {
    rocksname?: string;
    rocks: boolean;
}
interface VAgent extends BaseAgent {
    enlid?: string;
    vname?: string;
    Vverified: boolean;
    level: number;
    blacklisted: boolean;
}
interface ServerTeamAgent extends BaseAgent {
    shareWD?: boolean;
    loadWD?: boolean;
    state?: boolean;
    squad?: string;
}
export interface ServerAgent extends BaseAgent, RockAgent, VAgent, ServerTeamAgent {
}
interface TeamAgent extends BaseAgent {
    shareWDKeys?: boolean;
    loadWDKeys?: boolean;
    shareLocation?: boolean;
    comment?: string;
}
interface Agent extends BaseAgent, RockAgent, VAgent, TeamAgent {
    fetched?: number;
}
export default class WasabeeAgent implements Agent {
    id: GoogleID;
    name: string;
    pic?: string;
    lat: number;
    lng: number;
    date: string;
    communityname?: string;
    intelname?: string;
    intelfaction: "unset" | "ENLIGHTENED" | "RESISTANCE";
    enlid?: string;
    vname?: string;
    Vverified: boolean;
    level: number;
    blacklisted: boolean;
    rocksname?: string;
    rocks: boolean;
    shareWDKeys?: boolean;
    loadWDKeys?: boolean;
    shareLocation?: boolean;
    comment?: string;
    fetched: number;
    constructor(obj: Agent);
    getName(): string;
    _updateCache(): Promise<void>;
    get latLng(): import("leaflet").LatLng;
    static get(gid: string, maxAgeSeconds?: number): Promise<WasabeeAgent>;
}
export {};
