export interface PerformanceMetrics {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
    TTI?: number;
    TBT?: number;
    INP?: number;
}
export interface NavigationTiming {
    dnsTime: number;
    connectTime: number;
    requestTime: number;
    responseTime: number;
    domProcessingTime: number;
    domContentLoadedTime: number;
    loadTime: number;
    totalTime: number;
}
export type MetricsCallback = (metrics: PerformanceMetrics) => void;
export declare class MetricsCollector {
    private callback;
    private metrics;
    private observer;
    private fidObserver;
    private clsValue;
    private clsEntries;
    private sessionValue;
    private sessionEntries;
    constructor(callback: MetricsCallback);
    start(): void;
    stop(): void;
    private observePaintMetrics;
    private observeLCP;
    private observeFID;
    private observeCLS;
    private observeINP;
    private measureNavigationTiming;
    private reportMetrics;
    getMetrics(): PerformanceMetrics;
    markStart(name: string): void;
    markEnd(name: string): number | undefined;
    clearMarks(name?: string): void;
}
