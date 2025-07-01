export type EventListener<T = any> = (data: T) => void;
export type EventUnsubscribe = () => void;
export interface EventEmitterOptions {
    maxListeners?: number;
    captureRejections?: boolean;
}
export declare class EventEmitter<Events extends Record<string, any> = Record<string, any>> {
    private events;
    private maxListeners;
    private captureRejections;
    constructor(options?: EventEmitterOptions);
    on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): EventUnsubscribe;
    once<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): EventUnsubscribe;
    emit<K extends keyof Events>(event: K, ...args: Events[K] extends void ? [] : [Events[K]]): boolean;
    off<K extends keyof Events>(event: K, listener?: EventListener<Events[K]>): void;
    removeAllListeners(event?: keyof Events): void;
    listenerCount(event: keyof Events): number;
    eventNames(): (keyof Events)[];
    setMaxListeners(n: number): void;
    getMaxListeners(): number;
}
