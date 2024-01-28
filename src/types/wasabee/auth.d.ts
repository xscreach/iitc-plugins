import WasabeeMe from "./model/me";
export declare function deleteJWT(): void;
export declare function getJWT(): string;
/** wrap send access token to get me */
export declare function sendAccessToken(token: string): Promise<WasabeeMe>;
/** wrap ott to get me */
export declare function sendOneTimeToken(token: string): Promise<WasabeeMe>;
/** GAPI */
/**  */
export declare function isAuthAvailable(): boolean;
/** Get access token from google */
export declare function getAccessToken(selectAccount?: boolean): Promise<string>;
