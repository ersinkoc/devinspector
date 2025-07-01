export interface LongTask {
    id: string;
    duration: number;
    startTime: number;
    timestamp: number;
    attribution: Array<{
        name: string;
        containerType: string;
        containerSrc?: string;
        containerId?: string;
        containerName?: string;
    }>;
}
export type LongTaskCallback = (task: LongTask) => void;
export declare class LongTaskDetector {
    private callback;
    private observer;
    private threshold;
    private idCounter;
    constructor(callback: LongTaskCallback, threshold?: number);
    start(): void;
    stop(): void;
    private handleLongTask;
    private fallbackDetection;
}
