export interface FPSData {
    fps: number;
    timestamp: number;
    frameTime: number;
    droppedFrames: number;
}
export type FPSCallback = (data: FPSData) => void;
export declare class FPSMonitor {
    private callback;
    private isRunning;
    private lastTime;
    private frameCount;
    private fps;
    private frameTimeSum;
    private droppedFrames;
    private animationId;
    private updateInterval;
    private lastUpdateTime;
    constructor(callback: FPSCallback, updateInterval?: number);
    start(): void;
    stop(): void;
    private tick;
    getCurrentFPS(): number;
}
