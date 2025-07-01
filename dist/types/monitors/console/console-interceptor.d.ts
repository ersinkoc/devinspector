export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'trace' | 'table' | 'group' | 'groupCollapsed' | 'groupEnd' | 'clear' | 'count' | 'countReset' | 'time' | 'timeEnd' | 'timeLog' | 'assert' | 'dir' | 'dirxml' | 'profile' | 'profileEnd';
export interface ConsoleEntry {
    id: string;
    level: ConsoleLevel;
    args: any[];
    formattedArgs: any[];
    timestamp: number;
    stack?: string[];
    groupLevel: number;
    source?: {
        file?: string;
        line?: number;
        column?: number;
    };
}
export interface ConsoleEventHandler {
    onLog?: (entry: ConsoleEntry) => void;
    onClear?: () => void;
}
export declare class ConsoleInterceptor {
    private originalMethods;
    private handlers;
    private groupLevel;
    private counters;
    private timers;
    private captureStackTraces;
    constructor(handlers?: ConsoleEventHandler, captureStackTraces?: boolean);
    install(): void;
    uninstall(): void;
    private interceptMethod;
    private handleCount;
    private handleTimeEnd;
    private formatArgs;
    private formatValue;
    private extractSourceFromStack;
}
