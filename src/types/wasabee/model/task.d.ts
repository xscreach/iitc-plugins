export declare type TaskState = "pending" | "assigned" | "acknowledged" | "completed";
export declare function sanitizeState(v: string): TaskState;
export default class Task {
    ID: TaskID;
    order: number;
    zone: ZoneID;
    assignedTo?: GoogleID;
    comment?: string;
    dependsOn?: TaskID[];
    deltaminutes?: number;
    _state: TaskState;
    constructor(obj: any);
    toServer(): any;
    toJSON(): any;
    get state(): TaskState;
    set state(state: TaskState);
    setOrder(o: number | string): void;
    assign(gid?: GoogleID): void;
    complete(gid?: GoogleID): void;
    get completed(): boolean;
    set completed(v: boolean);
}
