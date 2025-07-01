export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: Parameters<T>) => void;
export declare function deepClone<T>(obj: T): T;
export declare function formatBytes(bytes: number, precision?: number): string;
export declare function formatDuration(ms: number): string;
export declare function generateId(): string;
export declare function isCircularReference(obj: any, seen?: WeakSet<object>): boolean;
export declare function safeStringify(obj: any, indent?: number): string;
export declare function getStackTrace(error?: Error): string[];
export declare function parseStackFrame(frame: string): {
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
} | null;
export declare function memoize<T extends (...args: any[]) => any>(fn: T, options?: {
    maxSize?: number;
    ttl?: number;
    keyResolver?: (...args: Parameters<T>) => string;
}): T;
export declare function createWorkerScript(fn: (...args: any[]) => any): string;
export declare function createObjectURL(content: string, type?: string): string;
export declare class Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    constructor();
}
