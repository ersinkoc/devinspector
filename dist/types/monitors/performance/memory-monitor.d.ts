export interface MemoryData {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    timestamp: number;
    percentUsed: number;
}
export type MemoryCallback = (data: MemoryData) => void;
declare global {
    interface Performance {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    }
}
export declare class MemoryMonitor {
    private callback;
    private intervalId;
    private updateInterval;
    private isSupported;
    constructor(callback: MemoryCallback, updateInterval?: number);
    private checkSupport;
    start(): void;
    stop(): void;
    private measure;
    getCurrentMemory(): MemoryData | null;
    isMemorySupported(): boolean;
}
