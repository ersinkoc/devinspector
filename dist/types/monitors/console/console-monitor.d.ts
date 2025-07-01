import { DevInspector } from '../../core/inspector';
import { ConsoleEntry } from './console-interceptor';
export interface ConsoleFilter {
    levels?: string[];
    search?: string;
    source?: string;
}
export declare class ConsoleMonitor {
    private inspector;
    private interceptor;
    private formatter;
    private isActive;
    private commandHistory;
    private historyIndex;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
    private handleLog;
    private handleClear;
    private setupCommandExecution;
    executeCommand(command: string): void;
    getHistory(): string[];
    navigateHistory(direction: 'up' | 'down'): string | undefined;
    filterLogs(filter: ConsoleFilter): ConsoleEntry[];
    exportLogs(format?: 'json' | 'text'): string;
}
