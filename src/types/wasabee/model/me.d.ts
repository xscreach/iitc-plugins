import WasabeeAgent from "./agent";
export interface MeTeam {
    ID: string;
    Name: string;
    RocksComm: string;
    RocksKey: string;
    JoinLinkToken: string;
    ShareWD: boolean;
    LoadWD: boolean;
    State: boolean;
    Owner: string;
    VTeam: string;
    VTeamRole: string;
}
interface MeOp {
    ID: OpID;
    Name: string;
    IsOwner: boolean;
    Color: string;
    TeamID: TeamID;
}
export default class WasabeeMe extends WasabeeAgent {
    querytoken?: string;
    lockey?: string;
    vapi?: string;
    Telegram: {
        ID: string;
        Verified: boolean;
        Authtoken: string;
    };
    Teams: MeTeam[];
    Ops: MeOp[];
    _teamMap: Map<string, boolean>;
    constructor(data: any);
    static maxCacheAge(): number;
    toJSON(): this;
    store(): void;
    remove(): void;
    static localGet(): WasabeeMe;
    static isLoggedIn(): boolean;
    static cacheGet(): WasabeeMe;
    static waitGet(force?: boolean, noFail?: boolean): Promise<WasabeeMe>;
    static purge(): Promise<void>;
    teamJoined(teamID: any): boolean;
    makeTeamMap(): void;
}
export {};
