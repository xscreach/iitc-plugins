export default class Evented {
    _events: {
        [event: string]: {
            fct: (data: unknown) => void;
            context: unknown;
        }[];
    };
    constructor();
    on(event: string, func: (data: unknown) => void, context?: unknown): this;
    off(event: string, func: (data: unknown) => void, context?: unknown): this;
    fire(event: string, data?: unknown): this;
}
