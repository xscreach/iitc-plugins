/// <reference types="jquery" />
/// <reference types="jqueryui" />
/// <reference types="spectrum" />
interface IServerError {
    code: number;
    text: string;
    error?: string;
}
export declare function displayInfo(content: string | HTMLElement, isHTML?: boolean): JQuery<HTMLElement>;
export declare function displayWarning(content: string | HTMLElement, isHTML?: boolean): JQuery<HTMLElement>;
export declare function displayError(err: {
    toString(): string;
}): JQuery<HTMLElement>;
export declare class ServerError implements IServerError {
    code: number;
    text: string;
    error?: string;
    constructor(obj: IServerError);
    toString(): string;
}
export {};
