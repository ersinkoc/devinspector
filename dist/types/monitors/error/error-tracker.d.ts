export interface ErrorInfo {
    id: string;
    type: 'error' | 'unhandledRejection';
    message: string;
    stack?: string[];
    stackFrames?: Array<{
        functionName?: string;
        fileName?: string;
        lineNumber?: number;
        columnNumber?: number;
    }>;
    source?: string;
    lineno?: number;
    colno?: number;
    timestamp: number;
    userAgent: string;
    url: string;
    errorObject?: any;
    groupId?: string;
    count: number;
}
export interface ErrorGroup {
    id: string;
    fingerprint: string;
    message: string;
    count: number;
    firstSeen: number;
    lastSeen: number;
    errors: ErrorInfo[];
}
export type ErrorCallback = (error: ErrorInfo) => void;
export declare class ErrorTracker {
    private callback;
    private groups;
    private seenErrors;
    private ignorePatterns;
    constructor(callback: ErrorCallback);
    private setupDefaultIgnorePatterns;
    addIgnorePattern(pattern: RegExp): void;
    trackError(error: Error | ErrorEvent | PromiseRejectionEvent, type?: 'error' | 'unhandledRejection'): void;
    private createErrorInfo;
    private shouldIgnoreError;
    private groupError;
    private generateFingerprint;
    private normalizeMessage;
    getGroups(): ErrorGroup[];
    getGroup(groupId: string): ErrorGroup | undefined;
    clearGroups(): void;
    getErrorStats(): {
        totalErrors: number;
        totalGroups: number;
        errorsByType: Record<string, number>;
        recentErrors: ErrorInfo[];
    };
}
