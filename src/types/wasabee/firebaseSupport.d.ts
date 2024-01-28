export declare function initFirebase(): void;
interface FirebaseMessage {
    id: string;
    method: string;
    action: string;
    error: string;
    app_name: string;
    app_version: string;
    server: string;
    jwt: string;
}
export declare function postToFirebase(message: Partial<FirebaseMessage>): void;
export {};
