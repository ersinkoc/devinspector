import { generateId, getStackTrace, safeStringify } from '../../core/utils';

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

export class ConsoleInterceptor {
  private originalMethods: Map<ConsoleLevel, (...args: any[]) => void> = new Map();
  private handlers: ConsoleEventHandler;
  private groupLevel: number = 0;
  private counters: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();
  private captureStackTraces: boolean;

  constructor(handlers: ConsoleEventHandler = {}, captureStackTraces: boolean = true) {
    this.handlers = handlers;
    this.captureStackTraces = captureStackTraces;
  }

  install(): void {
    const methods: ConsoleLevel[] = [
      'log', 'info', 'warn', 'error', 'debug', 'trace', 'table',
      'group', 'groupCollapsed', 'groupEnd', 'clear',
      'count', 'countReset', 'time', 'timeEnd', 'timeLog',
      'assert', 'dir', 'dirxml', 'profile', 'profileEnd'
    ];

    methods.forEach(method => {
      this.originalMethods.set(method, (console as any)[method]);
      this.interceptMethod(method);
    });
  }

  uninstall(): void {
    this.originalMethods.forEach((original, method) => {
      (console as any)[method] = original;
    });
    this.originalMethods.clear();
    this.counters.clear();
    this.timers.clear();
    this.groupLevel = 0;
  }

  private interceptMethod(method: ConsoleLevel): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const original = this.originalMethods.get(method)!;

    (console as any)[method] = function(...args: any[]) {
      // Call original method first
      original.apply(console, args);

      // Handle special methods
      switch (method) {
        case 'clear':
          self.handlers.onClear?.();
          return;
        
        case 'group':
        case 'groupCollapsed':
          self.groupLevel++;
          break;
        
        case 'groupEnd':
          self.groupLevel = Math.max(0, self.groupLevel - 1);
          break;
        
        case 'count':
          self.handleCount(args[0]);
          return;
        
        case 'countReset':
          self.counters.delete(args[0] || 'default');
          return;
        
        case 'time':
          self.timers.set(args[0] || 'default', performance.now());
          return;
        
        case 'timeEnd':
          self.handleTimeEnd(args[0], 'timeEnd');
          return;
        
        case 'timeLog':
          self.handleTimeEnd(args[0], 'timeLog');
          break;
        
        case 'assert':
          if (args[0]) return; // Don't log if assertion passes
          args = args.slice(1); // Remove condition
          break;
      }

      // Create log entry
      const entry: ConsoleEntry = {
        id: generateId(),
        level: method,
        args: args,
        formattedArgs: self.formatArgs(args),
        timestamp: Date.now(),
        groupLevel: self.groupLevel
      };

      // Capture stack trace if enabled
      if (self.captureStackTraces && (method === 'error' || method === 'warn' || method === 'trace')) {
        const stack = getStackTrace();
        entry.stack = stack.slice(1); // Remove this interceptor from stack
        entry.source = self.extractSourceFromStack(stack[1]);
      }

      self.handlers.onLog?.(entry);
    };
  }

  private handleCount(label?: string): void {
    const key = label || 'default';
    const count = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, count);

    const entry: ConsoleEntry = {
      id: generateId(),
      level: 'log',
      args: [`${key}: ${count}`],
      formattedArgs: [`${key}: ${count}`],
      timestamp: Date.now(),
      groupLevel: this.groupLevel
    };

    this.handlers.onLog?.(entry);
  }

  private handleTimeEnd(label: string | undefined, method: 'timeEnd' | 'timeLog'): void {
    const key = label || 'default';
    const startTime = this.timers.get(key);
    
    if (startTime === undefined) {
      const entry: ConsoleEntry = {
        id: generateId(),
        level: 'warn',
        args: [`Timer '${key}' does not exist`],
        formattedArgs: [`Timer '${key}' does not exist`],
        timestamp: Date.now(),
        groupLevel: this.groupLevel
      };
      this.handlers.onLog?.(entry);
      return;
    }

    const duration = performance.now() - startTime;
    
    if (method === 'timeEnd') {
      this.timers.delete(key);
    }

    const entry: ConsoleEntry = {
      id: generateId(),
      level: 'log',
      args: [`${key}: ${duration.toFixed(3)}ms`],
      formattedArgs: [`${key}: ${duration.toFixed(3)}ms`],
      timestamp: Date.now(),
      groupLevel: this.groupLevel
    };

    this.handlers.onLog?.(entry);
  }

  private formatArgs(args: any[]): any[] {
    return args.map(arg => this.formatValue(arg));
  }

  private formatValue(value: any): any {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return value;
    }
    
    if (value instanceof Error) {
      return {
        type: 'error',
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }
    
    if (value instanceof Date) {
      return {
        type: 'date',
        value: value.toISOString()
      };
    }
    
    if (value instanceof RegExp) {
      return {
        type: 'regexp',
        value: value.toString()
      };
    }
    
    if (typeof value === 'function') {
      return {
        type: 'function',
        name: value.name || '<anonymous>',
        value: value.toString().substring(0, 100)
      };
    }
    
    if (Array.isArray(value)) {
      return {
        type: 'array',
        length: value.length,
        value: value.slice(0, 100).map(v => this.formatValue(v))
      };
    }
    
    if (type === 'object') {
      try {
        // Check for circular references
        const stringified = safeStringify(value, 2);
        return {
          type: 'object',
          value: JSON.parse(stringified)
        };
      } catch (error) {
        return {
          type: 'object',
          value: '[Complex Object]'
        };
      }
    }
    
    return String(value);
  }

  private extractSourceFromStack(stackFrame?: string): ConsoleEntry['source'] | undefined {
    if (!stackFrame) return undefined;
    
    // Match patterns like "at functionName (file:line:column)" or "at file:line:column"
    const match = stackFrame.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
    
    if (!match) return undefined;
    
    const [, , file, line, column] = match;
    
    return {
      file: file.replace(/^.*\//, ''), // Get just filename
      line: parseInt(line, 10),
      column: parseInt(column, 10)
    };
  }
}