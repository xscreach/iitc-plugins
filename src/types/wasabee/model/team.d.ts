import WasabeeAgent, { ServerAgent } from "./agent";
interface RocksTeam {
    rc: string;
    rk: string;
}
interface VTeam {
    vt: string;
    vr: string;
}
interface ServerTeam extends RocksTeam, VTeam {
    id: TeamID;
    name: string;
    agents: ServerAgent[];
    jlt: string;
}
interface Team extends RocksTeam, VTeam {
    id: TeamID;
    name: string;
    agents: WasabeeAgent[];
    jlt: string;
    fetched?: number;
}
export default class WasabeeTeam implements Team {
    id: TeamID;
    name: string;
    agents: WasabeeAgent[];
    jlt: string;
    rc: string;
    rk: string;
    vt: string;
    vr: string;
    fetched: number;
    constructor(data: Team | ServerTeam);
    _updateCache(): Promise<void>;
    static get(teamID: any, maxAgeSeconds?: number): Promise<WasabeeTeam>;
}
export {};
