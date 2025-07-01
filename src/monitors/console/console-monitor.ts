import { DevInspector } from '../../core/inspector';
import { ConsoleInterceptor, ConsoleEntry } from './console-interceptor';
import { LogFormatter } from './log-formatter';

export interface ConsoleFilter {
  levels?: string[];
  search?: string;
  source?: string;
}

export class ConsoleMonitor {
  private inspector: DevInspector;
  private interceptor: ConsoleInterceptor;
  private formatter: LogFormatter;
  private isActive: boolean = false;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    this.formatter = new LogFormatter();
    
    this.interceptor = new ConsoleInterceptor({
      onLog: this.handleLog.bind(this),
      onClear: this.handleClear.bind(this)
    }, inspector.getConfig().captureStackTraces);
  }

  start(): void {
    if (this.isActive) return;
    
    this.interceptor.install();
    this.setupCommandExecution();
    
    this.isActive = true;
  }

  stop(): void {
    if (!this.isActive) return;
    
    this.interceptor.uninstall();
    
    this.isActive = false;
  }

  private handleLog(entry: ConsoleEntry): void {
    const storage = this.inspector.getStorage('console');
    storage.push(entry);
    
    this.inspector.getEvents().emit('console:log', entry);
    
    // Check for errors
    if (entry.level === 'error') {
      this.inspector.getEvents().emit('error:caught', {
        message: this.formatter.formatArgs(entry.args),
        stack: entry.stack,
        timestamp: entry.timestamp,
        source: 'console'
      });
    }
  }

  private handleClear(): void {
    const storage = this.inspector.getStorage('console');
    storage.clear();
    
    this.inspector.getEvents().emit('console:clear');
  }

  private setupCommandExecution(): void {
    // This would be called by the UI to execute commands
    this.inspector.on('console:execute', (command: string) => {
      this.executeCommand(command);
    });
  }

  executeCommand(command: string): void {
    // Add to history
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;
    
    // Log the command
    const commandEntry: ConsoleEntry = {
      id: `cmd-${Date.now()}`,
      level: 'log',
      args: [`> ${command}`],
      formattedArgs: [`> ${command}`],
      timestamp: Date.now(),
      groupLevel: 0
    };
    
    this.handleLog(commandEntry);
    
    // Execute the command
    try {
      // Create a function to evaluate the command in global scope
      const result = (0, eval)(command);
      
      if (result !== undefined) {
        const resultEntry: ConsoleEntry = {
          id: `result-${Date.now()}`,
          level: 'log',
          args: [result],
          formattedArgs: this.formatter.formatArgs([result]),
          timestamp: Date.now(),
          groupLevel: 0
        };
        
        this.handleLog(resultEntry);
      }
    } catch (error: any) {
      const errorEntry: ConsoleEntry = {
        id: `error-${Date.now()}`,
        level: 'error',
        args: [error],
        formattedArgs: this.formatter.formatArgs([error]),
        timestamp: Date.now(),
        groupLevel: 0,
        stack: error.stack?.split('\n')
      };
      
      this.handleLog(errorEntry);
    }
  }

  getHistory(): string[] {
    return [...this.commandHistory];
  }

  navigateHistory(direction: 'up' | 'down'): string | undefined {
    if (this.commandHistory.length === 0) return undefined;
    
    if (direction === 'up') {
      this.historyIndex = Math.max(0, this.historyIndex - 1);
    } else {
      this.historyIndex = Math.min(this.commandHistory.length - 1, this.historyIndex + 1);
    }
    
    return this.commandHistory[this.historyIndex];
  }

  filterLogs(filter: ConsoleFilter): ConsoleEntry[] {
    const storage = this.inspector.getStorage('console');
    const logs = storage.getAll() as ConsoleEntry[];
    
    return logs.filter(log => {
      // Filter by level
      if (filter.levels && filter.levels.length > 0) {
        if (!filter.levels.includes(log.level)) {
          return false;
        }
      }
      
      // Filter by search
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const argsString = JSON.stringify(log.formattedArgs).toLowerCase();
        if (!argsString.includes(searchLower)) {
          return false;
        }
      }
      
      // Filter by source
      if (filter.source && log.source?.file) {
        if (!log.source.file.includes(filter.source)) {
          return false;
        }
      }
      
      return true;
    });
  }

  exportLogs(format: 'json' | 'text' = 'json'): string {
    const logs = this.inspector.getStorage('console').getAll() as ConsoleEntry[];
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }
    
    // Text format
    return logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const level = log.level.toUpperCase().padEnd(5);
      const args = this.formatter.formatArgsAsText(log.formattedArgs);
      const source = log.source ? ` [${log.source.file}:${log.source.line}]` : '';
      
      return `[${timestamp}] ${level} ${args}${source}`;
    }).join('\n');
  }
}