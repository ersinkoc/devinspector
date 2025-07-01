import { DevInspector } from '../../core/inspector';
import { ErrorInfo } from './error-tracker';
export declare class ErrorMonitor {
    private inspector;
    private errorTracker;
    private sourceMapSupport;
    private isActive;
    private originalHandlers;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
    private installErrorHandlers;
    private uninstallErrorHandlers;
    private handleErrorEvent;
    private handleRejectionEvent;
    private handleError;
    trackError(error: Error): void;
    getErrorGroups(): import("./error-tracker").ErrorGroup[];
    getErrorStats(): {
        totalErrors: number;
        totalGroups: number;
        errorsByType: Record<string, number>;
        recentErrors: ErrorInfo[];
    };
    clearErrors(): void;
    addIgnorePattern(pattern: RegExp): void;
    enableSourceMaps(enabled: boolean): void;
}
