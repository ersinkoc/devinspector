import { DevInspector } from '../../core/inspector';
import { FPSData } from './fps-monitor';
import { MemoryData } from './memory-monitor';
import { PerformanceMetrics } from './metrics-collector';
import { LongTask } from './long-task-detector';
export interface PerformanceData {
    fps?: FPSData;
    memory?: MemoryData;
    metrics?: PerformanceMetrics;
    longTasks?: LongTask[];
    timestamp: number;
}
export declare class PerformanceMonitor {
    private inspector;
    private fpsMonitor;
    private memoryMonitor;
    private metricsCollector;
    private longTaskDetector;
    private isActive;
    private performanceData;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
    private handleFPSData;
    private handleMemoryData;
    private handleMetrics;
    private handleLongTask;
    private emitPerformanceData;
    private setupPerformanceObservers;
    private monitorResourceTiming;
    markStart(name: string): void;
    markEnd(name: string): void;
    getSnapshot(): PerformanceData;
}
